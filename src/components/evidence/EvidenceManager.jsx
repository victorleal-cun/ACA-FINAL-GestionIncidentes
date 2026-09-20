import React, { useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useLabContext } from '../../context/LabContext';
import { downloadBlob } from '../../utils/fileUtils';
import './EvidenceManager.css';

export default function EvidenceManager() {
  const { captures, removeCapture, clearCaptures, incrementDownloads } = useLabContext();
  const [selectedIds, setSelectedIds] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [fsStatus, setFsStatus] = useState('');

  // Manejar selección de casillas
  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === captures.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(captures.map((c) => c.id));
    }
  };

  // Descarga individual
  const handleDownloadSingle = (item) => {
    if (!item.blob) return;
    downloadBlob(item.blob, item.name);
    incrementDownloads();
  };

  // Empaquetado ZIP local estructurado
  const handleExportZip = async () => {
    const itemsToExport = selectedIds.length > 0
      ? captures.filter((c) => selectedIds.includes(c.id))
      : captures;

    if (itemsToExport.length === 0) return;

    setIsExporting(true);
    setFsStatus('Generando archivo ZIP en memoria local...');

    try {
      const zip = new JSZip();
      const rootFolder = zip.folder('evidencias_laboratorio');
      const imgFolder = rootFolder.folder('imagenes');
      const videoFolder = rootFolder.folder('videos');
      const regFolder = rootFolder.folder('registros');

      // Clasificar y agregar cada archivo en su respectiva carpeta
      for (const item of itemsToExport) {
        if (item.type === 'photo' && item.blob) {
          imgFolder.file(item.name, item.blob);
        } else if (item.type === 'video' && item.blob) {
          videoFolder.file(item.name, item.blob);
        } else if (item.type === 'report' && item.blob) {
          regFolder.file(item.name, item.blob);
        }
      }

      // Agregar archivo README de metadatos forenses
      const readmeContent = `NOVACONNECT SOLUTIONS // REPORTE DE EVIDENCIAS DIGITALES
Laboratorio Académico: Gestión de Incidentes y Respuesta a Ciberataques
Fecha de generación: ${new Date().toLocaleString('es-CO')}
Total de artefactos: ${itemsToExport.length}

Estructura de la evidencia:
├── imagenes/     (Capturas voluntarias de cámara web)
├── videos/       (Grabaciones de video en formato WebM/MP4)
└── registros/    (Registros de geolocalización y consentimientos)

Nota de integridad:
Todos los archivos fueron recopilados de forma local y voluntaria bajo autorización explícita del participante.
`;
      rootFolder.file('README_evidencias.txt', readmeContent);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(zipBlob, `evidencias_laboratorio_${Date.now()}.zip`);
      incrementDownloads();
      setFsStatus('¡Paquete ZIP descargado exitosamente!');
    } catch (err) {
      console.error('Error al empaquetar ZIP:', err);
      setFsStatus('Error al generar el archivo ZIP.');
    } finally {
      setIsExporting(false);
      setTimeout(() => setFsStatus(''), 4000);
    }
  };

  // Soporte de File System Access API para selección de carpeta destino nativa
  const handleSaveToDirectory = async () => {
    if (!('showDirectoryPicker' in window)) {
      setFsStatus('Tu navegador no soporta showDirectoryPicker(). Usando descarga en archivo ZIP.');
      handleExportZip();
      return;
    }

    const itemsToExport = selectedIds.length > 0
      ? captures.filter((c) => selectedIds.includes(c.id))
      : captures;

    if (itemsToExport.length === 0) return;

    try {
      setFsStatus('Selecciona la carpeta en tu equipo donde deseas guardar las evidencias...');
      const dirHandle = await window.showDirectoryPicker({
        id: 'novaconnect_evidencias',
        mode: 'readwrite',
      });

      // Crear subcarpetas
      const rootDir = await dirHandle.getDirectoryHandle('evidencias_laboratorio', { create: true });
      const imgDir = await rootDir.getDirectoryHandle('imagenes', { create: true });
      const videoDir = await rootDir.getDirectoryHandle('videos', { create: true });
      const regDir = await rootDir.getDirectoryHandle('registros', { create: true });

      let savedCount = 0;
      for (const item of itemsToExport) {
        let targetSubDir = regDir;
        if (item.type === 'photo') targetSubDir = imgDir;
        if (item.type === 'video') targetSubDir = videoDir;

        const fileHandle = await targetSubDir.getFileHandle(item.name, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(item.blob);
        await writable.close();
        savedCount++;
      }

      incrementDownloads();
      setFsStatus(`¡${savedCount} archivos guardados con éxito en la carpeta seleccionada!`);
    } catch (err) {
      if (err.name === 'AbortError') {
        setFsStatus('Selección de carpeta cancelada por el usuario.');
      } else {
        console.error('Error con File System API:', err);
        setFsStatus('No se pudo escribir en la carpeta. Intentando descarga en ZIP...');
        handleExportZip();
      }
    } finally {
      setTimeout(() => setFsStatus(''), 5000);
    }
  };

  return (
    <div className="evidence-manager card">
      <div className="evidence-header">
        <div className="evidence-title-area">
          <div className="evidence-badge-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
          <div>
            <h3 className="evidence-title">Almacenamiento de Evidencias Digitales</h3>
            <p className="evidence-subtitle">
              Descarga estructurada de capturas, videos y registros sin servidores intermediarios
            </p>
          </div>
        </div>

        <div className="evidence-count-badge">
          <span className="badge badge-active">{captures.length} Evidencia(s)</span>
        </div>
      </div>

      {/* Explicación de limitaciones del navegador */}
      <div className="browser-sandbox-note">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue-bright)" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="16" x2="12" y2="12"/>
          <line x1="12" y1="8" x2="12.01" y2="8"/>
        </svg>
        <p>
          <strong>Seguridad del Sandbox Web:</strong> Por diseño de seguridad del navegador, las páginas web no pueden escribir en carpetas arbitrarias del disco duro sin tu consentimiento explícito. Por ello, puedes guardar seleccionando tu carpeta con la <em>File System Access API</em> o descargando un archivo ZIP estructurado.
        </p>
      </div>

      {/* Lista de Evidencias */}
      {captures.length === 0 ? (
        <div className="evidence-empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="18" x2="12" y2="12"/>
            <line x1="9" y1="15" x2="15" y2="15"/>
          </svg>
          <h4>No hay evidencias generadas en esta sesión</h4>
          <p>
            Utiliza la cámara para tomar fotografías o grabar videos, o consulta la geolocalización para generar registros de laboratorio.
          </p>
        </div>
      ) : (
        <div className="evidence-content-area">
          <div className="evidence-table-toolbar">
            <button className="btn btn-ghost btn-sm" onClick={selectAll}>
              {selectedIds.length === captures.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
            </button>
            <span className="selection-count">
              {selectedIds.length > 0 ? `${selectedIds.length} seleccionada(s)` : 'Todos los archivos se exportarán'}
            </span>
            <button className="btn btn-ghost btn-sm text-danger" onClick={clearCaptures}>
              Limpiar todas
            </button>
          </div>

          <div className="evidence-items-list">
            {captures.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <div key={item.id} className={`evidence-item-row ${isSelected ? 'selected' : ''}`}>
                  <label className="checkbox-container">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(item.id)}
                    />
                    <span className="checkmark"></span>
                  </label>

                  <div className="item-icon">
                    {item.type === 'photo' && '📷'}
                    {item.type === 'video' && '🎬'}
                    {item.type === 'report' && '📄'}
                  </div>

                  <div className="item-details">
                    <span className="item-name">{item.name}</span>
                    <span className="item-date">
                      {item.formattedDate || new Date(item.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="item-actions">
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleDownloadSingle(item)}
                      title="Descargar este archivo individual"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                    </button>
                    <button
                      className="btn btn-ghost btn-sm text-danger"
                      onClick={() => removeCapture(captures.indexOf(item))}
                      title="Eliminar de memoria"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Estado de guardado / exportación */}
          {fsStatus && (
            <div className="fs-status-banner">
              <span className="status-dot status-dot-active"></span>
              <span>{fsStatus}</span>
            </div>
          )}

          {/* Botones de Exportación Estructurada */}
          <div className="export-action-buttons">
            <button
              className="btn btn-secondary btn-lg flex-1"
              onClick={handleSaveToDirectory}
              disabled={isExporting}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                <line x1="12" y1="11" x2="12" y2="17"/>
                <polyline points="9 14 12 11 15 14"/>
              </svg>
              Elegir carpeta de destino (API Nativa)
            </button>

            <button
              className="btn btn-primary btn-lg flex-1"
              onClick={handleExportZip}
              disabled={isExporting}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="21 8 21 21 3 21 3 8"/>
                <rect x="1" y="3" width="22" height="5"/>
                <line x1="10" y1="12" x2="14" y2="12"/>
              </svg>
              {isExporting ? 'Empaquetando...' : 'Descargar paquete ZIP estructurado'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
