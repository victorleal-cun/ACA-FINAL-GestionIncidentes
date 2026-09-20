import React from 'react';
import './ConsentBanner.css';

export default function ConsentBanner() {
  return (
    <section id="consentimiento" className="section section-alt" aria-labelledby="privacy-section-title">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Transparencia & Seguridad</span>
          <h2 id="privacy-section-title" className="section-title">Privacidad y Consentimiento Informado</h2>
          <p className="section-subtitle">
            Esta aplicación fue diseñada bajo los principios de Privacy by Design y Zero External Data Leaks para entornos académicos de ciberseguridad.
          </p>
        </div>

        <div className="privacy-principles-grid">
          <div className="principle-card card">
            <div className="principle-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <h4>Consentimiento Explícito</h4>
            <p>
              Ningún permiso (cámara, micrófono o geolocalización) se activa de manera automática ni encubierta. Cada solicitud requiere tu pulsación voluntaria en la interfaz.
            </p>
          </div>

          <div className="principle-card card">
            <div className="principle-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <line x1="8" y1="21" x2="16" y2="21"/>
                <line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <h4>Procesamiento 100% Local</h4>
            <p>
              Todo el renderizado de filtros visuales y la codificación de video se realizan en la memoria RAM y GPU local mediante HTML5 Canvas y MediaRecorder APIs.
            </p>
          </div>

          <div className="principle-card card">
            <div className="principle-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
              </svg>
            </div>
            <h4>Cero Telemetría y Rastreo</h4>
            <p>
              La aplicación no cuenta con Google Analytics, píxeles de redes sociales ni conexiones hacia APIs de terceros. Puedes comprobarlo en la pestaña Red de las herramientas de desarrollador.
            </p>
          </div>

          <div className="principle-card card">
            <div className="principle-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              </svg>
            </div>
            <h4>Liberación Total al Detener</h4>
            <p>
              Al pulsar "Detener cámara" o reiniciar la sesión, todas las pistas multimedia (MediaStreamTracks) son terminadas de inmediato y las URLs temporales en memoria son revocadas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
