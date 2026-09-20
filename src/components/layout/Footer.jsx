import React from 'react';
import { useNavigation } from '../../router/Router';
import './Footer.css';

export default function Footer() {
  const { navigate } = useNavigation();
  const currentYear = new Date().getFullYear();

  const handleLink = (e, path) => {
    if (path.startsWith('/')) {
      e.preventDefault();
      navigate(path);
    }
  };

  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width="36" height="36">
                <rect width="40" height="40" rx="10" fill="url(#footerGrad)"/>
                <path d="M12 28V12l8 7 8-7v16" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="20" cy="17" r="2.5" fill="#60a5fa" opacity="0.9"/>
                <defs>
                  <linearGradient id="footerGrad" x1="0" y1="0" x2="40" y2="40">
                    <stop stopColor="#2563eb"/>
                    <stop offset="1" stopColor="#1d4ed8"/>
                  </linearGradient>
                </defs>
              </svg>
              <div>
                <span className="footer-brand-name">NovaConnect Solutions</span>
                <span className="footer-brand-tagline">Ciberseguridad Empresarial</span>
              </div>
            </div>
            <p className="footer-description">
              Empresa ficticia creada como recurso académico para la demostración de conceptos de ciberseguridad.
            </p>
          </div>

          {/* Links */}
          <div className="footer-col">
            <h3 className="footer-col-title">Navegación</h3>
            <ul className="footer-col-links">
              <li><a href="#inicio">Inicio</a></li>
              <li><a href="/experiencia" onClick={(e) => handleLink(e, '/experiencia')}>Experiencia Participante</a></li>
              <li><a href="/lab/resultados" onClick={(e) => handleLink(e, '/lab/resultados')}>Panel Blue Team (Resultados)</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-title">Recursos</h3>
            <ul className="footer-col-links">
              <li><a href="#experiencia">Experiencia Visual</a></li>
              <li><a href="#privacidad">Privacidad</a></li>
              <li><a href="#documentacion">Documentación</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h3 className="footer-col-title">Académico</h3>
            <ul className="footer-col-links">
              <li><span>Especialización en Ciberseguridad</span></li>
              <li><span>CUN — Colombia</span></li>
              <li><span>Gestión de Incidentes</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-divider"></div>

        <div className="footer-bottom">
          <p className="footer-copy">
            © {currentYear} NovaConnect Solutions — <strong>Proyecto académico ficticio</strong>.
            No representa una empresa real.
          </p>
          <p className="footer-academic">
            Especialización en Ciberseguridad — CUN • Gestión de Incidentes y Respuesta a Ciberataques
          </p>
        </div>
      </div>
    </footer>
  );
}
