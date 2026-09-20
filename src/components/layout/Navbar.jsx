import React, { useState, useEffect } from 'react';
import { useNavigation } from '../../router/Router';
import './Navbar.css';

const NAV_LINKS = [
  { id: 'inicio', label: 'Inicio', href: '/' },
  { id: 'experiencia', label: 'Efectos Especiales ✨', href: '/experiencia' },
  { id: 'resultados', label: 'Panel Blue Team 🛡️', href: '/lab/resultados' },
];

export default function Navbar() {
  const { navigate } = useNavigation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleNavClick = (e, href) => {
    setMenuOpen(false);
    if (href.startsWith('/')) {
      e.preventDefault();
      navigate(href);
      return;
    }
    const el = document.querySelector(href);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`} role="navigation" aria-label="Navegación principal">
      <div className="navbar-inner container">
        {/* Logo */}
        <a href="#inicio" className="navbar-logo" onClick={(e) => handleNavClick(e, '#inicio')} aria-label="NovaConnect Solutions — Inicio">
          <div className="navbar-logo-icon">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="40" height="40" rx="10" fill="url(#logoGrad)"/>
              <path d="M12 28V12l8 7 8-7v16" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="20" cy="17" r="2.5" fill="#60a5fa" opacity="0.9"/>
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#2563eb"/>
                  <stop offset="1" stopColor="#1d4ed8"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="navbar-logo-text">
            <span className="navbar-brand">NovaConnect</span>
            <span className="navbar-brand-sub">Solutions</span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <ul className="navbar-links" role="menubar">
          {NAV_LINKS.map(link => (
            <li key={link.id} role="none">
              <a
                href={link.href}
                className="navbar-link"
                role="menuitem"
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <a
          href="/experiencia"
          className="btn btn-primary navbar-cta"
          onClick={(e) => handleNavClick(e, '/experiencia')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M9 3h6l3 7-6 11-6-11z"/>
            <path d="M9 10h6"/>
          </svg>
          Acceder al Laboratorio
        </a>

        {/* Hamburger */}
        <button
          className={`navbar-hamburger ${menuOpen ? 'active' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        className={`navbar-mobile ${menuOpen ? 'open' : ''}`}
        role="menu"
        aria-hidden={!menuOpen}
      >
        <ul className="navbar-mobile-links">
          {NAV_LINKS.map(link => (
            <li key={link.id} role="none">
              <a
                href={link.href}
                className="navbar-mobile-link"
                role="menuitem"
                tabIndex={menuOpen ? 0 : -1}
                onClick={(e) => handleNavClick(e, link.href)}
              >
                {link.label}
              </a>
            </li>
          ))}
          <li role="none">
            <a
              href="/experiencia"
              className="btn btn-primary navbar-mobile-cta"
              role="menuitem"
              tabIndex={menuOpen ? 0 : -1}
              onClick={(e) => handleNavClick(e, '/experiencia')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 3h6l3 7-6 11-6-11z"/>
                <path d="M9 10h6"/>
              </svg>
              Acceder al Laboratorio
            </a>
          </li>
        </ul>
      </div>

      {/* Overlay */}
      {menuOpen && <div className="navbar-overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
    </nav>
  );
}
