import React from 'react';
import './About.css';

const STATS = [
  { value: '150+', label: 'Proyectos', icon: '📋' },
  { value: '50+', label: 'Clientes', icon: '🏢' },
  { value: '99.9%', label: 'Disponibilidad', icon: '⚡' },
  { value: '24/7', label: 'Monitoreo', icon: '🛡️' },
];

export default function About() {
  return (
    <section id="nosotros" className="section section-alt" aria-labelledby="about-title">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Sobre nosotros</span>
          <h2 id="about-title" className="section-title">Innovación en ciberseguridad</h2>
          <p className="section-subtitle">
            NovaConnect Solutions es una empresa ficticia diseñada para demostrar capacidades tecnológicas en un entorno académico controlado.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-text">
            <div className="about-card card">
              <div className="about-card-icon" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue-bright)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3>Nuestra misión</h3>
              <p>
                Proteger los activos digitales de las organizaciones mediante soluciones avanzadas
                de ciberseguridad, respuesta a incidentes y análisis forense. Formamos equipos
                especializados en detección y mitigación de amenazas.
              </p>
            </div>

            <div className="about-card card">
              <div className="about-card-icon" aria-hidden="true">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-blue-bright)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v6l4 2"/>
                </svg>
              </div>
              <h3>Enfoque académico</h3>
              <p>
                Este laboratorio permite explorar cómo los navegadores web gestionan permisos
                de cámara, geolocalización y almacenamiento local. Cada interacción demuestra
                conceptos relevantes para equipos Red Team y Blue Team.
              </p>
            </div>
          </div>

          <div className="about-stats-grid">
            {STATS.map((stat) => (
              <div key={stat.label} className="about-stat card">
                <span className="about-stat-icon" aria-hidden="true">{stat.icon}</span>
                <span className="about-stat-value">{stat.value}</span>
                <span className="about-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
