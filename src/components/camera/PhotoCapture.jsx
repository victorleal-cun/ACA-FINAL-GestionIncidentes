import React, { useState } from 'react';
import { useLabContext } from '../../context/LabContext';
import { fileTimestamp, formatDateTime } from '../../utils/dateUtils';
import { downloadDataURL, dataURLtoBlob } from '../../utils/fileUtils';
import { savePhotoEvidence } from '../../services/storageService';
import './PhotoCapture.css';

export default function PhotoCapture({ canvasRef }) {
  const { captures, addCapture, incrementDownloads, cameraState } = useLabContext();
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [photoFormat, setPhotoFormat] = useState('image/png'); // 'image/png' | 'image/jpeg'

  const isCameraActive = cameraState === 'active';

  // Contar fotografías capturadas en la sesión actual
  const photoCaptures = captures.filter((c) => c.type === 'photo');

  // Capturar fotograma voluntario del canvas
  const handleTakeSnapshot = () => {
    if (!canvasRef || !canvasRef.current || !isCameraActive) return;

    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL(photoFormat, 0.95);
    const date = new Date();
    const ext = photoFormat === 'image/jpeg' ? 'jpg' : 'png';
    const filename = `novaconnect_captura_${fileTimestamp(date)}.${ext}`;

    setPreviewPhoto({
      dataUrl,
      filename,
      date,
      format: photoFormat,
      width: canvas.width,
      height: canvas.height,
    });
  };

  // Confirmar y almacenar en la sesión de laboratorio
  const handleConfirmPhoto = () => {
    if (!previewPhoto) return;

    const blob = dataURLtoBlob(previewPhoto.dataUrl);
    const url = URL.createObjectURL(blob);

    addCapture({
      id: Date.now(),
      type: 'photo',
      name: previewPhoto.filename,
      url,
      blob,
      timestamp: previewPhoto.date.getTime(),
      formattedDate: formatDateTime(previewPhoto.date),
      width: previewPhoto.width,
      height: previewPhoto.height,
    });

    savePhotoEvidence(null, {
      blob,
      dataUrl: previewPhoto.dataUrl,
      filter: 'Normal',
      filename: previewPhoto.filename,
    });

    setPreviewPhoto(null);
  };

  // Descartar captura sin guardar
  const handleDiscardPhoto = () => {
    setPreviewPhoto(null);
  };

  // Descarga directa inmediata voluntaria
  const handleDownloadNow = () => {
    if (!previewPhoto) return;
    downloadDataURL(previewPhoto.dataUrl, previewPhoto.filename);
    incrementDownloads();
    handleConfirmPhoto();
  };

  return (
    <div className="photo-capture-card card">
      <div className="photo-card-header">
        <div className="photo-title-area">
          <div className="photo-badge-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
          <div>
            <h4 className="photo-card-title">Captura Voluntaria de Imágenes</h4>
            <span className="photo-counter-text">
              Fotografías en sesión: <strong>{photoCaptures.length}</strong>
            </span>
          </div>
        </div>

        <div className="format-selector">
          <label htmlFor="photo-format" className="format-label">Formato:</label>
          <select
            id="photo-format"
            value={photoFormat}
            onChange={(e) => setPhotoFormat(e.target.value)}
            className="format-select"
            disabled={!isCameraActive}
          >
            <option value="image/png">PNG (Sin pérdida)</option>
            <option value="image/jpeg">JPEG (Comprimido)</option>
          </select>
        </div>
      </div>

      <div className="photo-action-container">
        <button
          className="btn btn-primary btn-lg w-full"
          onClick={handleTakeSnapshot}
          disabled={!isCameraActive}
          title={!isCameraActive ? 'Debes activar la cámara para tomar fotografías' : 'Capturar fotograma actual'}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <circle cx="12" cy="12" r="3" fill="currentColor"/>
          </svg>
          Tomar fotografía
        </button>

        {!isCameraActive && (
          <p className="photo-hint">
            * El botón se habilitará automáticamente al activar la cámara con tu consentimiento.
          </p>
        )}
      </div>

      {/* Modal de Previsualización y Confirmación */}
      {previewPhoto && (
        <div className="photo-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="modal-preview-title">
          <div className="photo-modal-card glass-card">
            <div className="photo-modal-header">
              <h3 id="modal-preview-title" className="modal-title">Revisión de Fotografía Capturada</h3>
              <button
                className="modal-close-btn"
                onClick={handleDiscardPhoto}
                aria-label="Cerrar y descartar"
              >
                ✕
              </button>
            </div>

            <div className="photo-modal-body">
              <div className="photo-preview-image-wrapper">
                <img
                  src={previewPhoto.dataUrl}
                  alt="Previsualización de fotografía voluntaria"
                  className="photo-preview-img"
                />
              </div>

              <div className="photo-meta-info">
                <div className="meta-row">
                  <span className="meta-label">Nombre asignado:</span>
                  <code className="meta-value">{previewPhoto.filename}</code>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Resolución:</span>
                  <span className="meta-value">{previewPhoto.width} × {previewPhoto.height} px</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Fecha y hora:</span>
                  <span className="meta-value">{formatDateTime(previewPhoto.date)}</span>
                </div>
                <div className="meta-row">
                  <span className="meta-label">Control de privacidad:</span>
                  <span className="meta-value text-success">100% en memoria local del navegador</span>
                </div>
              </div>
            </div>

            <div className="photo-modal-footer">
              <button className="btn btn-ghost" onClick={handleDiscardPhoto}>
                Descartar imagen
              </button>
              <div className="photo-modal-actions-right">
                <button className="btn btn-secondary" onClick={handleConfirmPhoto}>
                  Guardar en evidencias de sesión
                </button>
                <button className="btn btn-primary" onClick={handleDownloadNow}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Descargar ahora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mini galería de capturas de la sesión */}
      {photoCaptures.length > 0 && (
        <div className="session-gallery">
          <div className="gallery-header">
            <span className="gallery-title">Galería de la sesión actual</span>
            <span className="gallery-count">{photoCaptures.length} archivo(s)</span>
          </div>
          <div className="gallery-grid">
            {photoCaptures.map((item, idx) => (
              <div key={item.id || idx} className="gallery-thumb-item">
                <img src={item.url} alt={item.name} className="gallery-thumb-img" />
                <span className="gallery-thumb-name" title={item.name}>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
