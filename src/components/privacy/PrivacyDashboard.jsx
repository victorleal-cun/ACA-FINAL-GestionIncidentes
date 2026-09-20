import React, { useState } from 'react';
import { useLabContext } from '../../context/LabContext';
import { formatDuration } from '../../utils/dateUtils';
import './PrivacyDashboard.css';

export default function PrivacyDashboard() {
  const {
    cameraState,
    stopCamera,
    recordingState,
    recordingDuration,
    recordedBlob,
    locationState,
    locationData,
    isTracking,
    stopLocationTracking,
    captures,
    clearCaptures,
    downloadCount,
    resetAll,
  } = useLabContext();

  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const photoCount = captures.filter((c) => c.type === 'photo').length;
  const totalVideoSecs = recordedBlob ? recordedBlob.duration : recordingDuration;

  const handleExecuteReset = () => {
    resetAll();
    setConfirmReset(false);
  };

  const handleExecuteClear = () => {
    clearCaptures();
    setConfirmClear(false);
  };

  return (
    <div id="privacidad" className="privacy-dashboard card">
      <div className="privacy-header">
        <div className="privacy-title-area">
          <div className="privacy-shield-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div>
            <h3 className="privacy-title">Privacidad y Control</h3>
            <p className="privacy-subtitle">Supervisión en tiempo real de permisos y recursos del navegador</p>
          </div>
        </div>

        <div className="privacy-status-badge">
          <span className="badge badge-active">
            <span className="status-dot status-dot-active"></span> Aislamiento Local 100%
          </span>
        </div>
      </div>

      {/* Grid de Métricas de Privacidad */}
      <div className="privacy-metrics-grid">
        {/* Cámara */}
        <div className="privacy-metric-card">
          <div className="metric-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
              <circle cx="12" cy="13" r="4"/>
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-label">Estado de Cámara</span>
            <div className="metric-value-row">
              {cameraState === 'active' ? (
                <span className="status-pill status-pill-active">
                  <span className="status-dot status-dot-active"></span> Activa
                </span>
              ) : cameraState === 'requesting' ? (
                <span className="status-pill status-pill-warning">Solicitando</span>
              ) : cameraState === 'denied' ? (
                <span className="status-pill status-pill-danger">Denegado</span>
              ) : (
                <span className="status-pill status-pill-inactive">Inactiva / Apagada</span>
              )}
            </div>
          </div>
          {cameraState === 'active' && (
            <button className="btn btn-sm btn-danger" onClick={stopCamera} title="Liberar pistas de video">
              Detener
            </button>
          )}
        </div>

        {/* Grabación */}
        <div className="privacy-metric-card">
          <div className="metric-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7"/>
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-label">Estado de Grabación</span>
            <div className="metric-value-row">
              {recordingState === 'recording' ? (
                <span className="status-pill status-pill-danger">
                  <span className="status-dot status-dot-recording"></span> Grabando ({recordingDuration}s)
                </span>
              ) : (
                <span className="status-pill status-pill-inactive">Sin grabación activa</span>
              )}
            </div>
          </div>
        </div>

        {/* Ubicación */}
        <div className="privacy-metric-card">
          <div className="metric-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-label">Permiso de Ubicación</span>
            <div className="metric-value-row">
              {isTracking ? (
                <span className="status-pill status-pill-warning">
                  <span className="status-dot status-dot-recording"></span> Seguimiento Activo
                </span>
              ) : locationData ? (
                <span className="status-pill status-pill-active">
                  <span className="status-dot status-dot-active"></span> Autorizado por usuario
                </span>
              ) : locationState === 'denied' ? (
                <span className="status-pill status-pill-danger">Permiso Rechazado</span>
              ) : (
                <span className="status-pill status-pill-inactive">No solicitada</span>
              )}
            </div>
          </div>
          {isTracking && (
            <button className="btn btn-sm btn-danger" onClick={stopLocationTracking}>
              Detener
            </button>
          )}
        </div>

        {/* Fotografías */}
        <div className="privacy-metric-card">
          <div className="metric-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-label">Fotografías Tomadas</span>
            <span className="metric-counter">{photoCount} en sesión</span>
          </div>
        </div>

        {/* Video generado */}
        <div className="privacy-metric-card">
          <div className="metric-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-label">Video Generado</span>
            <span className="metric-counter">{formatDuration(totalVideoSecs)} total</span>
          </div>
        </div>

        {/* Descargas */}
        <div className="privacy-metric-card">
          <div className="metric-icon-wrap">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-label">Descargas de Evidencias</span>
            <span className="metric-counter">{downloadCount} realizada(s)</span>
          </div>
        </div>
      </div>

      {/* Controles Globales de Privacidad y Liberación de Recursos */}
      <div className="privacy-controls-bar">
        <span className="controls-bar-label">Acciones globales de seguridad:</span>
        <div className="controls-btn-group">
          {cameraState === 'active' && (
            <button className="btn btn-secondary btn-sm" onClick={stopCamera}>
              Apagar cámara
            </button>
          )}

          {isTracking && (
            <button className="btn btn-secondary btn-sm" onClick={stopLocationTracking}>
              Detener ubicación
            </button>
          )}

          {captures.length > 0 && !confirmClear && (
            <button className="btn btn-secondary btn-sm" onClick={() => setConfirmClear(true)}>
              Eliminar capturas temporales ({captures.length})
            </button>
          )}

          {confirmClear && (
            <div className="confirm-inline">
              <span className="confirm-text">¿Eliminar {captures.length} archivos de memoria?</span>
              <button className="btn btn-danger btn-sm" onClick={handleExecuteClear}>
                Sí, eliminar
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmClear(false)}>
                Cancelar
              </button>
            </div>
          )}

          {!confirmReset ? (
            <button className="btn btn-danger btn-sm" onClick={() => setConfirmReset(true)}>
              Reiniciar experiencia completa
            </button>
          ) : (
            <div className="confirm-inline">
              <span className="confirm-text">¿Liberar todos los recursos y reiniciar?</span>
              <button className="btn btn-danger btn-sm" onClick={handleExecuteReset}>
                Confirmar reinicio
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setConfirmReset(false)}>
                Cancelar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
