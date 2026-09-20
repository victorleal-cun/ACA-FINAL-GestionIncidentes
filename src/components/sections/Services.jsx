import React from 'react';
import './Services.css';

const SERVICES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
    title: 'Consultoría en Ciberseguridad',
    description: 'Evaluamos la postura de seguridad de tu organización e implementamos estrategias de protección personalizadas.',
    tag: 'Protección',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>
      </svg>
    ),
    title: 'Auditoría de Sistemas',
    description: 'Análisis exhaustivo de infraestructura, redes y aplicaciones para identificar vulnerabilidades críticas.',
    tag: 'Análisis',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    title: 'Respuesta a Incidentes',
    description: 'Equipos especializados para contener, investigar y remediar incidentes de seguridad en tiempo real.',
    tag: 'Respuesta',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        <line x1="11" y1="8" x2="11" y2="14"/>
        <line x1="8" y1="11" x2="14" y2="11"/>
      </svg>
    ),
    title: 'Análisis Forense Digital',
    description: 'Recolección y análisis de evidencias digitales con cadena de custodia para investigaciones y procesos legales.',
    tag: 'Forense',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/>
      </svg>
    ),
    title: 'Seguridad en la Nube',
    description: 'Protección integral de entornos cloud: configuración segura, monitoreo continuo y gestión de identidades.',
    tag: 'Cloud',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
      </svg>
    ),
    title: 'Capacitación Red Team / Blue Team',
    description: 'Formación práctica en tácticas ofensivas y defensivas para equipos de seguridad corporativa.',
    tag: 'Formación',
  },
];

export default function Services() {
  return (
    <section id="servicios" className="section" aria-labelledby="services-title">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Servicios</span>
          <h2 id="services-title" className="section-title">Soluciones integrales de seguridad</h2>
          <p className="section-subtitle">
            Ofrecemos un portafolio completo de servicios diseñados para proteger, detectar y responder ante amenazas cibernéticas.
          </p>
        </div>

        <div className="services-grid">
          {SERVICES.map((service, index) => (
            <div key={service.title} className="service-card card" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="service-card-header">
                <div className="service-icon">{service.icon}</div>
                <span className="service-tag badge badge-active">{service.tag}</span>
              </div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
              <div className="service-link">
                <span>Más información</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
