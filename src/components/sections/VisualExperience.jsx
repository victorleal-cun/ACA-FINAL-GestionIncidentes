import React, { useRef } from 'react';
import CameraModule from '../camera/CameraModule';
import PhotoCapture from '../camera/PhotoCapture';
import VideoRecorder from '../camera/VideoRecorder';
import './VisualExperience.css';

export default function VisualExperience() {
  const canvasRef = useRef(null);

  const handleCanvasReady = (canvasElement) => {
    canvasRef.current = canvasElement;
  };

  return (
    <section id="experiencia" className="section" aria-labelledby="visual-exp-title">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Demostración Multimedia</span>
          <h2 id="visual-exp-title" className="section-title">Experiencia Visual Interactiva</h2>
          <p className="section-subtitle">
            Prueba de permisos del navegador, procesamiento gráfico en tiempo real mediante Canvas API y generación voluntaria de artefactos de video e imagen.
          </p>
        </div>

        {/* Módulo principal de cámara y visor */}
        <div className="visual-experience-layout">
          <div className="visual-main-column">
            <CameraModule onCanvasReady={handleCanvasReady} />
          </div>

          <div className="visual-side-column">
            <PhotoCapture canvasRef={canvasRef} />
            <VideoRecorder canvasRef={canvasRef} />
          </div>
        </div>
      </div>
    </section>
  );
}
