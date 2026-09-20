import React from 'react';
import LocationModule from '../location/LocationModule';
import PrivacyDashboard from '../privacy/PrivacyDashboard';
import EvidenceManager from '../evidence/EvidenceManager';
import './LabPanel.css';

export default function LabPanel() {
  return (
    <section id="laboratorio" className="section section-alt" aria-labelledby="lab-panel-title">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Entorno de Simulación</span>
          <h2 id="lab-panel-title" className="section-title">Panel de Laboratorio Multimedia</h2>
          <p className="section-subtitle">
            Herramientas controladas para pruebas de geolocalización, supervisión de privacidad y gestión forense de evidencias digitales.
          </p>
        </div>

        <div className="lab-panel-grid">
          {/* Módulo de Ubicación Geográfica */}
          <div className="lab-grid-item">
            <LocationModule />
          </div>

          {/* Panel de Supervisión y Control de Privacidad */}
          <div className="lab-grid-item">
            <PrivacyDashboard />
          </div>

          {/* Gestor y Empaquetador de Evidencias */}
          <div className="lab-grid-item full-width">
            <EvidenceManager />
          </div>
        </div>
      </div>
    </section>
  );
}
