import React, { Suspense } from 'react';
import { LabProvider } from './context/LabContext';
import { Router, useNavigation } from './router/Router';
import './App.css';

// Lazy-load pages to isolate errors per route
const ParticipantExperience = React.lazy(() => import('./pages/ParticipantExperience'));
const LabResultsDashboard = React.lazy(() => import('./pages/LabResultsDashboard'));

// Lazy-load PortalView components
const Navbar = React.lazy(() => import('./components/layout/Navbar'));
const Hero = React.lazy(() => import('./components/sections/Hero'));
const VisualExperience = React.lazy(() => import('./components/sections/VisualExperience'));
const LabPanel = React.lazy(() => import('./components/sections/LabPanel'));
const ConsentBanner = React.lazy(() => import('./components/privacy/ConsentBanner'));
const Documentation = React.lazy(() => import('./components/sections/Documentation'));
const Footer = React.lazy(() => import('./components/layout/Footer'));

// Error Boundary para atrapar y mostrar errores de cualquier componente
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary capturó:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#090d16',
          color: '#f8fafc',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>
            ⚠️ Error en {this.props.name || 'la aplicación'}
          </h2>
          <pre style={{
            color: '#fbbf24',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            maxWidth: '600px',
            marginBottom: '1.5rem',
            background: '#1e293b',
            padding: '1rem',
            borderRadius: '8px',
            textAlign: 'left',
            fontSize: '0.85rem'
          }}>
            {this.state.error?.message || 'Error inesperado'}
            {'\n\n'}
            {this.state.error?.stack || ''}
          </pre>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null, errorInfo: null });
              window.location.href = '/';
            }}
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Volver al Inicio
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Spinner de carga
function LoadingSpinner() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#090d16',
      color: '#94a3b8',
      fontFamily: 'system-ui, sans-serif',
      fontSize: '1.1rem'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid #1e293b',
          borderTop: '3px solid #2563eb',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }} />
        <p>Cargando...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}

function PortalView() {
  return (
    <div className="app-layout">
      <ErrorBoundary name="Navbar">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
      </ErrorBoundary>

      <main id="main-content">
        <ErrorBoundary name="Hero">
          <Suspense fallback={null}>
            <Hero />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary name="VisualExperience">
          <Suspense fallback={null}>
            <VisualExperience />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary name="LabPanel">
          <Suspense fallback={null}>
            <LabPanel />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary name="ConsentBanner">
          <Suspense fallback={null}>
            <ConsentBanner />
          </Suspense>
        </ErrorBoundary>

        <ErrorBoundary name="Documentation">
          <Suspense fallback={null}>
            <Documentation />
          </Suspense>
        </ErrorBoundary>
      </main>

      <ErrorBoundary name="Footer">
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}

function AppRoutes() {
  const { currentPath } = useNavigation();
  const normalized = (currentPath || '/').toLowerCase().trim().replace(/\/+$/, '') || '/';

  if (normalized.includes('experiencia')) {
    return (
      <ErrorBoundary name="Experiencia VFX">
        <Suspense fallback={<LoadingSpinner />}>
          <ParticipantExperience />
        </Suspense>
      </ErrorBoundary>
    );
  }

  if (normalized.includes('resultado') || normalized.includes('blue') || normalized.includes('auditor')) {
    return (
      <ErrorBoundary name="Panel de Resultados">
        <Suspense fallback={<LoadingSpinner />}>
          <LabResultsDashboard />
        </Suspense>
      </ErrorBoundary>
    );
  }

  return <PortalView />;
}

export default function App() {
  return (
    <ErrorBoundary name="Aplicación Principal">
      <Router>
        <LabProvider>
          <AppRoutes />
        </LabProvider>
      </Router>
    </ErrorBoundary>
  );
}
