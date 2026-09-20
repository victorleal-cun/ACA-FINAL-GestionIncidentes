import React, { useState } from 'react';
import { useMediaRecorder } from '../../hooks/useMediaRecorder';
import { useLabContext } from '../../context/LabContext';
import { formatDuration } from '../../utils/dateUtils';
import { downloadBlob } from '../../utils/fileUtils';
import './VideoRecorder.css';

export default function VideoRecorder({ canvasRef }) {
  const { cameraState, cameraStream, incrementDownloads } = useLabContext();
  const [selectedMaxDuration, setSelectedMaxDuration] = useState(30);

  const {
    recordingState,
    recordingDuration,
    recordedBlob,
    recorderError,
    maxDuration,
    setMaxDuration,
    startRecording,
    stopRecording,
    isRecording,
  } = useMediaRecorder();

  const isCameraActive = cameraState === 'active';

  // Iniciar la grabación capturando el stream del Canvas (incluye los efectos visuales)
  const handleStart = () => {
    if (!isCameraActive) return;

    // Si el Canvas está listo, capturamos su stream para incluir los efectos visuales
    let streamToRecord = null;
    if (canvasRef && canvasRef.current && canvasRef.current.captureStream) {
      streamToRecord = canvasRef.current.captureStream(30); // 30 FPS
    } else if (cameraStream) {
      streamToRecord = cameraStream;
    }

    if (streamToRecord) {
      setMaxDuration(selectedMaxDuration);
      startRecording(streamToRecord);
    }
  };

  const handleDownloadVideo = () => {
    if (!recordedBlob || !recordedBlob.blob) return;
    downloadBlob(recordedBlob.blob, recordedBlob.name);
    incrementDownloads();
  };

  return (
    <div className="video-recorder-card card">
      <div className="video-card-header">
        <div className="video-title-area">
          <div className="video-badge-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </div>
          <div>
            <h4 className="video-card-title">Grabación de Video Corto</h4>
            <span className="video-status-text">
              {isRecording ? (
                <span className="text-danger">
                  <span className="status-dot status-dot-recording"></span> Grabando en vivo ({formatDuration(recordingDuration)})
                </span>
              ) : (
                'Duración máxima de 30 segundos — MediaRecorder API'
              )}
            </span>
          </div>
        </div>

        {/* Selector de límite de duración */}
        {!isRecording && (
          <div className="duration-selector">
            <label htmlFor="max-duration-select" className="duration-label">Límite:</label>
            <select
              id="max-duration-select"
              value={selectedMaxDuration}
              onChange={(e) => setSelectedMaxDuration(Number(e.target.value))}
              className="duration-select"
              disabled={isRecording}
            >
              <option value={10}>10 seg</option>
              <option value={20}>20 seg</option>
              <option value={30}>30 seg (defecto)</option>
            </select>
          </div>
        )}
      </div>

      {/* Indicador de grabación activa y temporizador */}
      {isRecording && (
        <div className="recording-live-banner">
          <div className="recording-badge-pulse">
            <span className="rec-dot"></span>
            REC
          </div>
          <div className="recording-timer">
            {formatDuration(recordingDuration)} / {formatDuration(selectedMaxDuration)}
          </div>
          <div className="recording-progress-bar">
            <div
              className="recording-progress-fill"
              style={{ width: `${(recordingDuration / selectedMaxDuration) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Mensaje de error de grabación si ocurre */}
      {recorderError && (
        <div className="video-error-banner" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{recorderError}</span>
        </div>
      )}

      {/* Acciones principales de grabación */}
      <div className="video-actions">
        {!isRecording ? (
          <button
            className="btn btn-primary btn-lg w-full"
            onClick={handleStart}
            disabled={!isCameraActive}
            title={!isCameraActive ? 'Debes activar la cámara antes de grabar' : 'Iniciar grabación'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
            </svg>
            Iniciar grabación voluntaria
          </button>
        ) : (
          <button className="btn btn-danger btn-lg w-full" onClick={stopRecording}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
            </svg>
            Detener grabación ({formatDuration(recordingDuration)})
          </button>
        )}
      </div>

      {/* Previsualización del video generado */}
      {recordedBlob && (
        <div className="recorded-preview-section">
          <div className="preview-heading">
            <span className="preview-label">Último video grabado con éxito:</span>
            <span className="badge badge-active">Listo para descarga</span>
          </div>

          <div className="video-player-wrapper">
            <video
              src={recordedBlob.url}
              controls
              playsInline
              className="recorded-video-player"
            />
          </div>

          <div className="preview-meta">
            <div className="meta-item">
              <span className="meta-title">Archivo:</span>
              <code className="meta-text">{recordedBlob.name}</code>
            </div>
            <div className="meta-item">
              <span className="meta-title">Duración:</span>
              <span className="meta-text">{recordedBlob.duration}s</span>
            </div>
            <div className="meta-item">
              <span className="meta-title">Formato:</span>
              <span className="meta-text">{recordedBlob.mimeType}</span>
            </div>
          </div>

          <button className="btn btn-success btn-lg w-full" onClick={handleDownloadVideo}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Descargar video ({recordedBlob.name})
          </button>
        </div>
      )}
    </div>
  );
}
