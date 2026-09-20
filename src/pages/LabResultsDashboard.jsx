import React, { useState, useEffect, useMemo } from 'react';
import {
  getAllSessions,
  deleteSession,
  exportSessionZip,
  generateLocationTxtReport,
  getAuditLogs,
} from '../services/storageService';
import { login, logout, isAuthenticated, getCurrentUser } from '../services/authService';
import { formatDateTime } from '../utils/dateUtils';
import { downloadBlob, downloadDataURL, dataURLtoBlob } from '../utils/fileUtils';
import { useNavigation } from '../router/Router';
import './LabResultsDashboard.css';

export default function LabResultsDashboard() {
  const { navigate } = useNavigation();
  const [authed, setAuthed] = useState(() => {
    try {
      return isAuthenticated();
    } catch {
      return false;
    }
  });
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Datos
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Detalle de Sesión Seleccionada
  const [selectedSession, setSelectedSession] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [actionNotice, setActionNotice] = useState('');

  // Cargar sesiones de forma segura
  const loadSessions = async () => {
    setLoadingLoading(true);
    try {
      const list = await getAllSessions();
      setSessions(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error('Error cargando sesiones:', err);
      setSessions([]);
    } finally {
      setLoadingLoading(false);
    }
  };

  useEffect(() => {
    if (authed) {
      loadSessions();
    }
  }, [authed]);

  const notify = (msg) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(''), 4000);
  };

  // Manejar Login
  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const res = await login(username, password);
      if (res.success) {
        setAuthed(true);
        setUsername('');
        setPassword('');
        loadSessions();
      } else {
        setLoginError(res.message || 'Credenciales incorrectas.');
      }
    } catch (err) {
      console.error('Error en autenticación:', err);
      setLoginError('Error interno en la autenticación.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Manejar Logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // ignore
    }
    setAuthed(false);
    setSelectedSession(null);
  };

  // Abrir modal de auditoría
  const handleOpenAudit = async () => {
    try {
      const logs = await getAuditLogs();
      setAuditLogs(Array.isArray(logs) ? logs : []);
    } catch (err) {
      console.error(err);
      setAuditLogs([]);
    }
    setShowAuditModal(true);
  };

  // Eliminar sesión
  const handleDeleteSession = async (sessId) => {
    if (!sessId) return;
    if (window.confirm(`¿Seguro que deseas eliminar definitivamente la sesión ${sessId}? Esta acción no se puede deshacer.`)) {
      try {
        await deleteSession(sessId);
        notify(`Sesión ${sessId} eliminada de forma segura.`);
        if (selectedSession?.id === sessId) {
          setSelectedSession(null);
        }
        loadSessions();
      } catch (err) {
        console.error(err);
        notify('Error al eliminar la sesión.');
      }
    }
  };

  // Descargar TXT de ubicación
  const handleDownloadLocationTxt = (sess, loc) => {
    try {
      const txt = generateLocationTxtReport(sess, loc);
      const blob = new Blob([txt], { type: 'text/plain;charset=utf-8' });
      downloadBlob(blob, `registro_ubicacion_${sess?.id || 'LAB'}.txt`);
      notify('Reporte TXT de ubicación descargado.');
    } catch (err) {
      console.error(err);
      notify('Error al exportar reporte TXT.');
    }
  };

  // Filtrado de sesiones 100% seguro
  const filteredSessions = useMemo(() => {
    if (!Array.isArray(sessions)) return [];
    return sessions.filter((s) => {
      if (!s || typeof s !== 'object') return false;
      const sId = String(s.id || '').toLowerCase();
      const query = String(searchTerm || '').trim().toLowerCase();
      const matchesSearch = query ? sId.includes(query) : true;
      const sDate = String(s.createdAt || '');
      const matchesDate = !dateFilter || sDate.startsWith(dateFilter);
      return matchesSearch && matchesDate;
    });
  }, [sessions, searchTerm, dateFilter]);

  // Cálculos de métricas para tarjetas KPI 100% seguro
  const metrics = useMemo(() => {
    let consentCount = 0;
    let photosCount = 0;
    let videosCount = 0;
    let locsCount = 0;

    if (Array.isArray(sessions)) {
      sessions.forEach((s) => {
        if (!s) return;
        if (s.consent?.informedConsentAccepted) consentCount += 1;
        photosCount += Array.isArray(s.photos) ? s.photos.length : 0;
        videosCount += Array.isArray(s.videos) ? s.videos.length : 0;
        locsCount += Array.isArray(s.locations) ? s.locations.length : 0;
      });
    }

    return {
      total: Array.isArray(sessions) ? sessions.length : 0,
      consent: consentCount,
      photos: photosCount,
      videos: videosCount,
      locations: locsCount,
    };
  }, [sessions]);

  // -------------------------------------------------------------
  // VISTA 1: Login de Acceso Protegido Blue Team
  // -------------------------------------------------------------
  if (!authed) {
    return (
      <div className="lab-login-page">
        <div className="lab-login-card card animate-fade-in">
          <div className="lab-login-header">
            <div className="lab-shield-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M9 12l2 2 4-4" stroke="#60a5fa" strokeWidth="2.5" />
              </svg>
            </div>
            <span className="lab-login-tag">Acceso Restringido</span>
            <h1 className="lab-login-title">Panel Blue Team — Auditoría</h1>
            <p className="lab-login-subtitle">
              Consulta autorizada de evidencias y análisis de incidentes de laboratorio.
            </p>
          </div>

          <form onSubmit={handleLogin} className="lab-login-form">
            {loginError && (
              <div className="lab-login-error animate-fade-in" role="alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{loginError}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="lab-user" className="form-label">Identificador de Usuario</label>
              <input
                id="lab-user"
                type="text"
                className="form-input"
                placeholder="Ej. blueteam"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lab-pass" className="form-label">Contraseña Criptográfica</label>
              <input
                id="lab-pass"
                type="password"
                className="form-input"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg lab-login-btn"
              disabled={loginLoading}
            >
              {loginLoading ? 'Verificando con SHA-256...' : 'Ingresar al Panel de Resultados'}
            </button>
          </form>

          <div className="lab-login-footer">
            <div className="lab-academic-notice">
              <span>Especialización en Ciberseguridad — CUN</span>
              <small>Credenciales didácticas: <code>blueteam</code> / <code>LabSecure2026!</code></small>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
              ← Volver al Portal Principal
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VISTA 2: Dashboard Principal Blue Team
  // -------------------------------------------------------------
  return (
    <div className="lab-dashboard-page">
      {/* Top Navbar */}
      <header className="lab-dash-navbar">
        <div className="container lab-dash-nav-inner">
          <div className="lab-nav-brand">
            <div className="lab-nav-badge">BLUE TEAM</div>
            <span className="lab-nav-title">Panel Privado de Resultados — Laboratorio ACA</span>
          </div>

          <div className="lab-nav-actions">
            <span className="lab-user-tag">
              <span className="lab-status-online"></span>
              Operador: <strong>{getCurrentUser() || 'blueteam'}</strong>
            </span>
            <button className="btn btn-secondary btn-sm" onClick={handleOpenAudit}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span>Auditoría</span>
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/experiencia')}>
              Ir a /experiencia
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Alerta flotante */}
      {actionNotice && (
        <div className="lab-toast-alert animate-fade-in" role="alert">
          <span>{actionNotice}</span>
        </div>
      )}

      <main className="container lab-dash-content">
        {/* Encabezado */}
        <div className="lab-section-header">
          <div>
            <h1 className="lab-title">Gestión de Evidencias y Trazabilidad</h1>
            <p className="lab-subtitle">
              Inspección de sesiones voluntarias generadas en la experiencia de participante.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadSessions} disabled={loadingSessions}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10" />
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
            </svg>
            {loadingSessions ? 'Actualizando...' : 'Recargar Datos'}
          </button>
        </div>

        {/* Tarjetas KPI */}
        <div className="lab-kpi-grid">
          <div className="lab-kpi-card card">
            <span className="kpi-label">Total Sesiones</span>
            <span className="kpi-val">{metrics.total}</span>
            <span className="kpi-desc">Registradas en el Laboratorio</span>
          </div>
          <div className="lab-kpi-card card">
            <span className="kpi-label">Con Consentimiento</span>
            <span className="kpi-val text-success">{metrics.consent}</span>
            <span className="kpi-desc">Marco ético informado</span>
          </div>
          <div className="lab-kpi-card card">
            <span className="kpi-label">Fotografías Guardadas</span>
            <span className="kpi-val text-blue">{metrics.photos}</span>
            <span className="kpi-desc">Capturas con efectos visuales</span>
          </div>
          <div className="lab-kpi-card card">
            <span className="kpi-label">Videos Grabados</span>
            <span className="kpi-val text-purple">{metrics.videos}</span>
            <span className="kpi-desc">Archivos WebM en base de datos</span>
          </div>
          <div className="lab-kpi-card card">
            <span className="kpi-label">Coordenadas GPS</span>
            <span className="kpi-val text-amber">{metrics.locations}</span>
            <span className="kpi-desc">Registros de telemetría</span>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="lab-filter-bar card">
          <div className="lab-search-input-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              className="lab-search-input"
              placeholder="Buscar por ID de sesión (Ej. LAB-2026-X)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="lab-date-filter-wrap">
            <label htmlFor="date-filter">Fecha:</label>
            <input
              id="date-filter"
              type="date"
              className="lab-date-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
            {dateFilter && (
              <button className="btn btn-ghost btn-xs" onClick={() => setDateFilter('')}>
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* Tabla de Sesiones */}
        <div className="lab-table-card card">
          <div className="table-responsive">
            <table className="lab-table">
              <thead>
                <tr>
                  <th>ID de Sesión</th>
                  <th>Fecha y Hora</th>
                  <th>Estado</th>
                  <th>Cámara</th>
                  <th>Ubicación</th>
                  <th>Evidencias</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredSessions.length > 0 ? (
                  filteredSessions.map((s) => {
                    const photoCount = Array.isArray(s.photos) ? s.photos.length : 0;
                    const videoCount = Array.isArray(s.videos) ? s.videos.length : 0;
                    const locCount = Array.isArray(s.locations) ? s.locations.length : 0;
                    const totalEvidences = photoCount + videoCount + locCount;

                    return (
                      <tr key={s.id || Math.random()} className={selectedSession?.id === s.id ? 'active-row' : ''}>
                        <td>
                          <code className="session-id-tag">{s.id || 'N/A'}</code>
                        </td>
                        <td>{formatDateTime(s.createdAt)}</td>
                        <td>
                          <span className={`status-pill ${s.status === 'completed' ? 'completed' : 'in-progress'}`}>
                            {s.status === 'completed' ? 'Completada' : 'En progreso'}
                          </span>
                        </td>
                        <td>
                          {s.consent?.cameraAuthorized || photoCount > 0 || videoCount > 0 ? (
                            <span className="badge-granted">✓ {photoCount} fotos, {videoCount} vid</span>
                          ) : (
                            <span className="badge-none">No autorizada</span>
                          )}
                        </td>
                        <td>
                          {s.consent?.locationAuthorized || locCount > 0 ? (
                            <span className="badge-granted">✓ {locCount} reg</span>
                          ) : (
                            <span className="badge-none">No autorizada</span>
                          )}
                        </td>
                        <td>
                          <strong>{totalEvidences}</strong> archivos
                        </td>
                        <td>
                          <div className="lab-action-buttons">
                            <button
                              className="btn btn-secondary btn-xs"
                              onClick={() => setSelectedSession(s)}
                            >
                              Ver Detalle
                            </button>
                            <button
                              className="btn btn-ghost btn-xs"
                              title="Descargar paquete ZIP institucional"
                              onClick={() => exportSessionZip(s)}
                            >
                              Descargar ZIP
                            </button>
                            <button
                              className="btn btn-danger btn-xs"
                              title="Eliminar sesión definitivamente"
                              onClick={() => handleDeleteSession(s.id)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="lab-empty-table">
                      {sessions.length === 0
                        ? 'No hay sesiones registradas en el laboratorio. Ingresa a /experiencia para generar capturas de prueba.'
                        : 'No se encontraron sesiones que coincidan con los filtros de búsqueda.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detalle de Sesión Seleccionada */}
        {selectedSession && (
          <div className="lab-detail-card card animate-fade-in">
            <div className="lab-detail-header">
              <div>
                <span className="exp-tag-pill">EXPEDIENTE DE SESIÓN</span>
                <h2 className="lab-detail-title">{selectedSession.id}</h2>
                <span className="lab-detail-date">
                  Iniciada el: {formatDateTime(selectedSession.createdAt)}
                  {selectedSession.completedAt && ` — Finalizada el: ${formatDateTime(selectedSession.completedAt)}`}
                </span>
              </div>
              <div className="lab-detail-top-actions">
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => exportSessionZip(selectedSession)}
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Exportar Paquete ZIP
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDeleteSession(selectedSession.id)}
                >
                  Eliminar Sesión
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedSession(null)}>
                  ✕ Cerrar Ficha
                </button>
              </div>
            </div>

            {/* Ficha de Consentimientos */}
            <div className="lab-consent-summary-box">
              <h4>Consentimientos Registrados</h4>
              <div className="consent-chips">
                <span className="chip-granted">✓ Marco ético informado aceptado</span>
                <span className={selectedSession.consent?.cameraAuthorized || (selectedSession.photos && selectedSession.photos.length > 0) ? 'chip-granted' : 'chip-denied'}>
                  {selectedSession.consent?.cameraAuthorized || (selectedSession.photos && selectedSession.photos.length > 0) ? '✓ Cámara autorizada' : '✗ Cámara no autorizada'}
                </span>
                <span className={selectedSession.consent?.locationAuthorized || (selectedSession.locations && selectedSession.locations.length > 0) ? 'chip-granted' : 'chip-denied'}>
                  {selectedSession.consent?.locationAuthorized || (selectedSession.locations && selectedSession.locations.length > 0) ? '✓ Ubicación autorizada' : '✗ Ubicación no autorizada'}
                </span>
              </div>
            </div>

            {/* Galería de Fotografías Autorizadas */}
            <div className="lab-evidence-section">
              <h3 className="section-subtitle-dash">
                Fotografías Autorizadas ({Array.isArray(selectedSession.photos) ? selectedSession.photos.length : 0})
              </h3>
              {Array.isArray(selectedSession.photos) && selectedSession.photos.length > 0 ? (
                <div className="lab-photo-grid">
                  {selectedSession.photos.map((photo) => (
                    <div key={photo.id || Math.random()} className="lab-photo-thumb-card">
                      <img
                        src={photo.dataUrl}
                        alt={photo.name || 'Fotografía'}
                        className="lab-photo-thumb-img"
                        onClick={() => setPreviewImage(photo)}
                      />
                      <div className="lab-photo-meta">
                        <span className="photo-filter-badge">{photo.filter || 'Efecto'}</span>
                        <span className="photo-time">{formatDateTime(photo.timestamp)}</span>
                        <button
                          className="btn btn-secondary btn-xs download-photo-btn"
                          onClick={() => {
                            if (photo.blob) {
                              downloadBlob(photo.blob, photo.name || `FOTO_${Date.now()}.png`);
                            } else if (photo.dataUrl) {
                              downloadDataURL(photo.dataUrl, photo.name || `FOTO_${Date.now()}.png`);
                            }
                          }}
                        >
                          Descargar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="lab-no-data">Sin fotografías autorizadas en esta sesión.</p>
              )}
            </div>

            {/* Reproductor de Video Autorizado */}
            <div className="lab-evidence-section">
              <h3 className="section-subtitle-dash">
                Videos Autorizados ({Array.isArray(selectedSession.videos) ? selectedSession.videos.length : 0})
              </h3>
              {Array.isArray(selectedSession.videos) && selectedSession.videos.length > 0 ? (
                <div className="lab-video-grid">
                  {selectedSession.videos.map((vid) => {
                    const videoUrl = vid.blob ? URL.createObjectURL(vid.blob) : (vid.dataUrl || vid.url);
                    return (
                      <div key={vid.id || Math.random()} className="lab-video-player-card">
                        <video src={videoUrl} controls className="lab-video-element" />
                        <div className="lab-video-meta">
                          <div>
                            <strong>{vid.name || 'Grabación WebM'}</strong>
                            <p>Duración: {vid.duration || 0}s | Registrado: {formatDateTime(vid.timestamp)}</p>
                          </div>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              if (vid.blob) {
                                downloadBlob(vid.blob, vid.name || `VIDEO_${Date.now()}.webm`);
                              } else if (vid.dataUrl) {
                                downloadBlob(dataURLtoBlob(vid.dataUrl), vid.name || `VIDEO_${Date.now()}.webm`);
                              }
                            }}
                          >
                            Descargar Video
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="lab-no-data">Sin videos autorizados en esta sesión.</p>
              )}
            </div>

            {/* Registro de Ubicación */}
            <div className="lab-evidence-section">
              <div className="loc-section-title-row">
                <h3 className="section-subtitle-dash">
                  Registros de Ubicación Autorizados ({Array.isArray(selectedSession.locations) ? selectedSession.locations.length : 0})
                </h3>
                {Array.isArray(selectedSession.locations) && selectedSession.locations.length > 0 && (
                  <button
                    className="btn btn-secondary btn-xs"
                    onClick={() => handleDownloadLocationTxt(selectedSession)}
                  >
                    Exportar TXT Oficial
                  </button>
                )}
              </div>

              {Array.isArray(selectedSession.locations) && selectedSession.locations.length > 0 ? (
                <div className="table-responsive">
                  <table className="lab-table loc-table">
                    <thead>
                      <tr>
                        <th>Fecha y Hora</th>
                        <th>Latitud</th>
                        <th>Longitud</th>
                        <th>Precisión</th>
                        <th>Origen</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSession.locations.map((loc) => (
                        <tr key={loc.id || Math.random()}>
                          <td>{formatDateTime(loc.timestamp)}</td>
                          <td><code>{Number(loc.latitude || 0).toFixed(6)}°</code></td>
                          <td><code>{Number(loc.longitude || 0).toFixed(6)}°</code></td>
                          <td>±{loc.accuracy ? Number(loc.accuracy).toFixed(1) : 'N/A'} m</td>
                          <td>Geolocation API</td>
                          <td>
                            <button
                              className="btn btn-ghost btn-xs"
                              onClick={() => handleDownloadLocationTxt(selectedSession, loc)}
                            >
                              Descargar TXT
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="lab-no-data">Sin datos de ubicación registrados.</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modal de Imagen Ampliada */}
      {previewImage && (
        <div className="lab-modal-backdrop" onClick={() => setPreviewImage(null)}>
          <div className="lab-modal-box card" onClick={(e) => e.stopPropagation()}>
            <div className="lab-modal-header">
              <div>
                <h3>{previewImage.name || 'Vista Ampliada'}</h3>
                <small>Filtro: {previewImage.filter || 'Normal'} | {formatDateTime(previewImage.timestamp)}</small>
              </div>
              <button className="lab-modal-close" onClick={() => setPreviewImage(null)}>✕</button>
            </div>
            <div className="lab-modal-img-wrap">
              <img src={previewImage.dataUrl} alt="Vista ampliada" className="lab-modal-full-img" />
            </div>
            <div className="lab-modal-footer">
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  if (previewImage.blob) {
                    downloadBlob(previewImage.blob, previewImage.name || `FOTO_${Date.now()}.png`);
                  } else if (previewImage.dataUrl) {
                    downloadDataURL(previewImage.dataUrl, previewImage.name || `FOTO_${Date.now()}.png`);
                  }
                }}
              >
                Descargar Imagen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Auditoría */}
      {showAuditModal && (
        <div className="lab-modal-backdrop" onClick={() => setShowAuditModal(false)}>
          <div className="lab-modal-box audit-modal card" onClick={(e) => e.stopPropagation()}>
            <div className="lab-modal-header">
              <h3>Registro de Auditoría y Accesos</h3>
              <button className="lab-modal-close" onClick={() => setShowAuditModal(false)}>✕</button>
            </div>
            <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              <table className="lab-table">
                <thead>
                  <tr>
                    <th>Fecha / Hora</th>
                    <th>Evento</th>
                    <th>Usuario</th>
                    <th>Estado</th>
                    <th>Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.length > 0 ? (
                    auditLogs.map((log) => (
                      <tr key={log.id || Math.random()}>
                        <td>{formatDateTime(log.timestamp)}</td>
                        <td><code>{log.event || 'EVENTO'}</code></td>
                        <td>{log.username || 'Sistema'}</td>
                        <td>
                          <span className={`status-pill ${log.status === 'SUCCESS' ? 'completed' : 'in-progress'}`}>
                            {log.status || 'INFO'}
                          </span>
                        </td>
                        <td>{log.details || ''}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="lab-empty-table">Sin registros de auditoría aún.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="lab-modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setShowAuditModal(false)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
