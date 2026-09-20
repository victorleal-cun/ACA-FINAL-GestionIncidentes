import React from 'react';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useLabContext } from '../../context/LabContext';
import { formatDateTime } from '../../utils/dateUtils';
import { generateLocationReport, downloadBlob } from '../../utils/fileUtils';
import './LocationModule.css';

export default function LocationModule() {
  const {
    locationState,
    locationData,
    locationHistory,
    locationError,
    isTracking,
    requestLocation,
    startTracking,
    stopTracking,
  } = useGeolocation();

  const { addCapture, incrementDownloads } = useLabContext();

  // Descargar el archivo registro_ubicacion_lab.txt
  const handleDownloadReport = () => {
    if (!locationData) return;

    const reportContent = generateLocationReport(locationData);
    if (!reportContent) return;

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const filename = 'registro_ubicacion_lab.txt';

    downloadBlob(blob, filename);
    incrementDownloads();

    // Guardar registro en la lista de evidencias
    addCapture({
      id: Date.now(),
      type: 'report',
      name: filename,
      blob,
      timestamp: Date.now(),
      formattedDate: formatDateTime(new Date()),
      details: `Lat: ${locationData.latitude}, Lon: ${locationData.longitude}`,
    });
  };

  const isAuthorized = locationData !== null;

  return (
    <div className="location-module card">
      {/* Encabezado */}
      <div className="location-header">
        <div className="location-title-area">
          <div className="location-badge-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <div>
            <h3 className="location-title">Ubicación del Laboratorio</h3>
            <p className="location-subtitle">Consulta controlada mediante la Geolocation API del navegador</p>
          </div>
        </div>

        <div className="location-status">
          {isTracking ? (
            <span className="badge badge-recording">
              <span className="status-dot status-dot-recording"></span> Seguimiento Activo
            </span>
          ) : isAuthorized ? (
            <span className="badge badge-active">
              <span className="status-dot status-dot-active"></span> Autorizado
            </span>
          ) : locationState === 'requesting' ? (
            <span className="badge badge-warning">
              <span className="status-dot status-dot-active"></span> Esperando autorización...
            </span>
          ) : (
            <span className="badge badge-inactive">
              <span className="status-dot status-dot-inactive"></span> Sin acceso
            </span>
          )}
        </div>
      </div>

      {/* Aviso de consentimiento explícito */}
      <div className="consent-banner">
        <svg className="consent-banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <p>
          <strong>Información sobre geolocalización:</strong> A continuación se solicitará el permiso para consultar las coordenadas del dispositivo con fines demostrativos para el análisis de incidentes. Puedes rechazar o permitir la solicitud. Los datos se procesan únicamente en tu equipo y jamás se envían a servidores externos.
        </p>
      </div>

      {/* Panel de visualización de coordenadas */}
      {isAuthorized ? (
        <div className="coordinates-display-card">
          <div className="coord-grid">
            <div className="coord-item">
              <span className="coord-label">Latitud</span>
              <span className="coord-value">{locationData.latitude.toFixed(6)}°</span>
            </div>
            <div className="coord-item">
              <span className="coord-label">Longitud</span>
              <span className="coord-value">{locationData.longitude.toFixed(6)}°</span>
            </div>
            <div className="coord-item">
              <span className="coord-label">Precisión estimada</span>
              <span className="coord-value">± {locationData.accuracy ? locationData.accuracy.toFixed(1) : '—'} m</span>
            </div>
            <div className="coord-item">
              <span className="coord-label">Fecha y hora</span>
              <span className="coord-value">{formatDateTime(new Date(locationData.timestamp))}</span>
            </div>
          </div>

          <div className="coord-map-hint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <span>Coordenadas reales reportadas por el sistema operativo / GPS del participante.</span>
          </div>
        </div>
      ) : (
        <div className="location-empty-state">
          <div className="empty-geo-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </div>
          <h4>Ubicación no consultada</h4>
          <p>Pulsa el botón inferior para solicitar acceso voluntario a las coordenadas del dispositivo.</p>
        </div>
      )}

      {/* Manejo de errores */}
      {locationError && (
        <div className="location-error-banner" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <p>{locationError}</p>
        </div>
      )}

      {/* Controles de ubicación */}
      <div className="location-actions">
        {!isAuthorized ? (
          <button
            className="btn btn-primary btn-lg w-full"
            onClick={requestLocation}
            disabled={locationState === 'requesting'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {locationState === 'requesting' ? 'Consultando...' : 'Compartir mi ubicación'}
          </button>
        ) : (
          <div className="location-btn-group">
            <button className="btn btn-secondary" onClick={requestLocation}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              Actualizar ubicación
            </button>

            {!isTracking ? (
              <button className="btn btn-secondary" onClick={startTracking}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 14 14" />
                </svg>
                Iniciar seguimiento periódico
              </button>
            ) : (
              <button className="btn btn-danger" onClick={stopTracking}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                Detener seguimiento
              </button>
            )}

            <button className="btn btn-primary" onClick={handleDownloadReport}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Descargar registro (.txt)
            </button>
          </div>
        )}
      </div>

      {/* Historial reciente de consultas */}
      {locationHistory.length > 1 && (
        <div className="location-history-section">
          <span className="history-title">Historial de actualizaciones voluntarias ({locationHistory.length})</span>
          <div className="history-list">
            {locationHistory.slice(0, 4).map((h, index) => (
              <div key={index} className="history-row">
                <span className="history-time">{formatDateTime(new Date(h.timestamp))}</span>
                <span className="history-coords">{h.latitude.toFixed(5)}, {h.longitude.toFixed(5)}</span>
                <span className="history-acc">±{h.accuracy ? h.accuracy.toFixed(0) : '0'}m</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
