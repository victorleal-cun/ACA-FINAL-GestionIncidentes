import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useCamera } from '../../hooks/useCamera';
import { useLabContext } from '../../context/LabContext';
import { EFFECTS_MAP, ParticleSystem } from '../../utils/canvasEffects';
import './CameraModule.css';

export default function CameraModule({ onCanvasReady }) {
  const {
    cameraState,
    cameraStream,
    cameraError,
    deviceInfo,
    requestCamera,
    stopCamera,
    isActive,
  } = useCamera();

  const { activeEffects, setActiveEffects } = useLabContext();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const animationFrameIdRef = useRef(null);
  const particleSystemRef = useRef(null);

  // Toggle visual effect
  const toggleEffect = (effectId) => {
    setActiveEffects((prev) =>
      prev.includes(effectId) ? prev.filter((id) => id !== effectId) : [...prev, effectId]
    );
  };

  // Asignar el MediaStream al elemento <video>
  useEffect(() => {
    if (videoRef.current && cameraStream) {
      videoRef.current.srcObject = cameraStream;
      videoRef.current.play().catch((e) => console.error('Error al reproducir video:', e));
    } else if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [cameraStream]);

  // Notificar al componente padre del canvas cuando esté listo
  useEffect(() => {
    if (canvasRef.current && onCanvasReady) {
      onCanvasReady(canvasRef.current);
    }
  }, [onCanvasReady, isActive]);

  // Ciclo de renderizado Canvas en tiempo real (60 FPS vía requestAnimationFrame)
  const renderFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || video.readyState < 2) {
      animationFrameIdRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // 1. Dibujar el fotograma original del video con modo espejo (selfie)
    ctx.save();
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, width, height);
    ctx.restore();

    // 2. Aplicar efectos según selección del usuario
    if (activeEffects.includes('cinematic')) {
      EFFECTS_MAP.cinematic.apply(ctx, width, height);
    }
    if (activeEffects.includes('warm')) {
      EFFECTS_MAP.warm.apply(ctx, width, height);
    }
    if (activeEffects.includes('vignette')) {
      EFFECTS_MAP.vignette.apply(ctx, width, height);
    }

    // Efecto de partículas interactivas
    if (activeEffects.includes('particles')) {
      if (!particleSystemRef.current) {
        particleSystemRef.current = new ParticleSystem(width, height);
      }
      particleSystemRef.current.update();
      particleSystemRef.current.draw(ctx);
    } else {
      particleSystemRef.current = null;
    }

    // Marco decorativo (siempre al frente)
    if (activeEffects.includes('frame')) {
      EFFECTS_MAP.frame.apply(ctx, width, height);
    }

    animationFrameIdRef.current = requestAnimationFrame(renderFrame);
  }, [activeEffects]);

  useEffect(() => {
    if (isActive) {
      animationFrameIdRef.current = requestAnimationFrame(renderFrame);
    } else {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
        animationFrameIdRef.current = null;
      }
      // Limpiar canvas cuando se apague
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [isActive, renderFrame]);

  return (
    <div className="camera-module card">
      {/* Encabezado del Módulo */}
      <div className="camera-header">
        <div className="camera-header-info">
          <h3 className="camera-title">Cámara & Procesamiento Visual</h3>
          <p className="camera-subtitle">Procesamiento local frame-a-frame mediante Canvas API</p>
        </div>
        <div className="camera-status-badge">
          {isActive ? (
            <span className="badge badge-active">
              <span className="status-dot status-dot-active"></span> Cámara Activa
            </span>
          ) : cameraState === 'requesting' ? (
            <span className="badge badge-warning">
              <span className="status-dot status-dot-active"></span> Solicitando Permiso...
            </span>
          ) : (
            <span className="badge badge-inactive">
              <span className="status-dot status-dot-inactive"></span> Inactiva
            </span>
          )}
        </div>
      </div>

      {/* Aviso previo de consentimiento explícito */}
      {!isActive && (
        <div className="consent-banner">
          <svg className="consent-banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p>
            <strong>Aviso de privacidad:</strong> Esta experiencia utiliza tu cámara para aplicar efectos visuales en tiempo real. No se activará hasta que otorgues el permiso correspondiente. Puedes detenerla en cualquier momento. El procesamiento se realiza 100% de forma local en tu navegador.
          </p>
        </div>
      )}

      {/* Contenedor del Visor */}
      <div className="camera-viewport-container">
        {/* Video oculto que alimenta el Canvas */}
        <video
          ref={videoRef}
          className="camera-video-hidden"
          playsInline
          muted
          autoPlay
          aria-hidden="true"
        />

        {/* Canvas visible con efectos en tiempo real */}
        <div className={`camera-canvas-wrapper ${isActive ? 'active' : ''}`}>
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="camera-canvas"
            aria-label="Vista previa de cámara con efectos visuales"
          />

          {!isActive && (
            <div className="camera-placeholder">
              <div className="placeholder-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </div>
              <h4>Cámara apagada</h4>
              <p>Haz clic en "Activar cámara" para conceder permiso explícito y comenzar la prueba.</p>
              {cameraState === 'stopped' && (
                <span className="placeholder-note">La cámara fue detenida y los recursos fueron liberados.</span>
              )}
            </div>
          )}

          {/* Overlays decorativos de HUD de laboratorio cuando está activa */}
          {isActive && (
            <div className="camera-hud-overlay" aria-hidden="true">
              <div className="hud-corner top-left"></div>
              <div className="hud-corner top-right"></div>
              <div className="hud-corner bottom-left"></div>
              <div className="hud-corner bottom-right"></div>
              <div className="hud-tag">NOVACONNECT SEC-LAB // LIVE FEED</div>
              <div className="hud-res">{deviceInfo.width}x{deviceInfo.height} px</div>
            </div>
          )}
        </div>
      </div>

      {/* Manejo de errores amigables */}
      {cameraError && (
        <div className="camera-error-banner card" role="alert">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2">
            <polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div className="error-message">
            <strong>Atención sobre el dispositivo:</strong>
            <p>{cameraError}</p>
          </div>
        </div>
      )}

      {/* Controles de Cámara */}
      <div className="camera-controls">
        {!isActive ? (
          <button
            className="btn btn-primary btn-lg"
            onClick={requestCamera}
            disabled={cameraState === 'requesting'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            {cameraState === 'requesting' ? 'Solicitando acceso...' : 'Activar cámara'}
          </button>
        ) : (
          <button className="btn btn-danger btn-lg" onClick={stopCamera}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            </svg>
            Detener cámara
          </button>
        )}
      </div>

      {/* Panel de Efectos Visuales (Disponible cuando la cámara esté activa) */}
      {isActive && (
        <div className="effects-panel">
          <div className="effects-panel-title">
            <span>Filtros y efectos en tiempo real:</span>
            <small>Procesamiento 100% en cliente (GPU/CPU Canvas)</small>
          </div>
          <div className="effects-pills">
            {Object.values(EFFECTS_MAP).map((effect) => {
              const isSelected = activeEffects.includes(effect.id);
              return (
                <button
                  key={effect.id}
                  className={`effect-pill ${isSelected ? 'active' : ''}`}
                  onClick={() => toggleEffect(effect.id)}
                  title={effect.description}
                  aria-pressed={isSelected}
                >
                  <span className="effect-icon">{effect.icon}</span>
                  <span className="effect-name">{effect.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
