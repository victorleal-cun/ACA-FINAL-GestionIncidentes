import React from 'react';
import './Hero.css';

export default function Hero() {
  const scrollTo = (id) => {
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="inicio" className="hero" aria-label="Sección principal">
      {/* Background effects */}
      <div className="hero-bg" aria-hidden="true">
        <div className="hero-gradient-orb hero-orb-1"></div>
        <div className="hero-gradient-orb hero-orb-2"></div>
        <div className="hero-gradient-orb hero-orb-3"></div>
        <div className="hero-grid-pattern"></div>
      </div>

      <div className="container hero-content">
        <div className="hero-badge animate-fade-in">
          <span className="status-dot status-dot-active"></span>
          Laboratorio Académico de Ciberseguridad
        </div>

        <h1 className="hero-title animate-fade-in-up delay-1">
          Transformamos la tecnología en{' '}
          <span className="hero-title-accent">experiencias seguras</span>
        </h1>

        <p className="hero-subtitle animate-fade-in-up delay-2">
          Plataforma de demostración para la gestión de incidentes y respuesta a ciberataques.
          Explora permisos del navegador, procesamiento multimedia y evidencias digitales
          en un entorno controlado.
        </p>

        <div className="hero-actions animate-fade-in-up delay-3">
          <button className="btn btn-primary btn-lg" onClick={() => scrollTo('#experiencia')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4M12 8h.01"/>
            </svg>
            Conocer más
          </button>
          <button className="btn btn-secondary btn-lg" onClick={() => scrollTo('#experiencia')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94L6.73 20.2a2.83 2.83 0 01-4-4l6.76-6.76a6 6 0 017.94-7.94l-3.76 3.76z"/>
            </svg>
            Iniciar experiencia
          </button>
        </div>

        <div className="hero-stats animate-fade-in-up delay-4">
          <div className="hero-stat">
            <span className="hero-stat-value">100%</span>
            <span className="hero-stat-label">Local</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <span className="hero-stat-value">0</span>
            <span className="hero-stat-label">Datos externos</span>
          </div>
          <div className="hero-stat-divider"></div>
          <div className="hero-stat">
            <span className="hero-stat-value">Seguro</span>
            <span className="hero-stat-label">Consentimiento explícito</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="hero-scroll-indicator animate-fade-in delay-5" aria-hidden="true">
        <div className="hero-scroll-mouse">
          <div className="hero-scroll-dot"></div>
        </div>
      </div>
    </section>
  );
}
