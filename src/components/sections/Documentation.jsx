import React, { useState } from 'react';
import { downloadBlob } from '../../utils/fileUtils';
import { useLabContext } from '../../context/LabContext';
import './Documentation.css';

const DEFAULT_CHECKLIST = [
  { id: 'env', label: 'Configuración del entorno de laboratorio (localhost / HTTPS aislado)', checked: true },
  { id: 'perm', label: 'Validación de permisos explícitos concedidos y rechazados (cámara / GPS)', checked: true },
  { id: 'ui', label: 'Comportamiento de la interfaz y feedback visual accesible', checked: true },
  { id: 'photo', label: 'Pruebas de captura voluntaria de fotografías con metadatos', checked: false },
  { id: 'video', label: 'Pruebas de grabación voluntaria con temporizador y límite de 30s', checked: false },
  { id: 'loc', label: 'Pruebas de consulta y descarga de archivo de ubicación (.txt)', checked: false },
  { id: 'sec', label: 'Inspección de tráfico de red (Zero External Data Leaks / Sin rastreadores)', checked: true },
  { id: 'blue', label: 'Análisis Blue Team sobre eventos de telemetría y liberación de recursos', checked: false },
];

export default function Documentation() {
  const { captures, downloadCount } = useLabContext();
  const [checklist, setChecklist] = useState(DEFAULT_CHECKLIST);
  const [observations, setObservations] = useState(
    'Durante la simulación se comprobó que el navegador solicita permisos exclusivamente por acción del usuario. En la inspección con DevTools no se registraron llamadas externas hacia APIs o telemetría de terceros.'
  );
  const [blueTeamFindings, setBlueTeamFindings] = useState(
    '1. Respeto al principio de menor privilegio en Web APIs.\n2. Cierre efectivo de MediaStreamTracks al finalizar sesión.\n3. Ausencia de recolección de credenciales y datos sensibles.'
  );

  const toggleCheck = (id) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleExportDocReport = () => {
    const textContent = `════════════════════════════════════════════════════════════════
  INFORME ACADÉMICO DE LABORATORIO — CIBERSEGURIDAD
  ESPECIALIZACIÓN EN CIBERSEGURIDAD — CUN
  GESTIÓN DE INCIDENTES Y RESPUESTA A CIBERATAQUES
════════════════════════════════════════════════════════════════

Organización ficticia: NovaConnect Solutions
Fecha del reporte:      ${new Date().toLocaleString('es-CO')}
Objetivo:               Simulación Red Team / Blue Team sobre permisos web

────────────────────────────────────────────────────────────────
  1. LISTA DE VERIFICACIÓN DE PRUEBAS
────────────────────────────────────────────────────────────────
${checklist
  .map((item) => `[${item.checked ? 'X' : ' '}] ${item.label}`)
  .join('\n')}

────────────────────────────────────────────────────────────────
  2. EVIDENCIAS RECOLECTADAS EN SESIÓN
────────────────────────────────────────────────────────────────
- Fotografías en memoria: ${captures.filter((c) => c.type === 'photo').length}
- Videos generados:       ${captures.filter((c) => c.type === 'video').length}
- Registros generados:    ${captures.filter((c) => c.type === 'report').length}
- Total de descargas:     ${downloadCount}

────────────────────────────────────────────────────────────────
  3. OBSERVACIONES DE SEGURIDAD Y PRIVACIDAD
────────────────────────────────────────────────────────────────
${observations}

────────────────────────────────────────────────────────────────
  4. HALLAZGOS PARA EL ANÁLISIS BLUE TEAM
────────────────────────────────────────────────────────────────
${blueTeamFindings}

════════════════════════════════════════════════════════════════
  Documento generado para fines estrictamente académicos.
════════════════════════════════════════════════════════════════
`;

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, `informe_laboratorio_ciberseguridad_${Date.now()}.txt`);
  };

  return (
    <section id="documentacion" className="section" aria-labelledby="doc-title">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Registro Académico</span>
          <h2 id="doc-title" className="section-title">Documentación & Análisis Blue Team</h2>
          <p className="section-subtitle">
            Bitácora de pruebas para la actividad de Gestión de Incidentes y Respuesta a Ciberataques (CUN).
          </p>
        </div>

        <div className="doc-grid">
          {/* Checklist */}
          <div className="doc-card card">
            <h3 className="doc-card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 11 12 14 22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              Matriz de Verificación de Laboratorio
            </h3>
            <p className="doc-card-desc">
              Marca las pruebas completadas durante la sesión de laboratorio:
            </p>

            <div className="doc-checklist">
              {checklist.map((item) => (
                <label key={item.id} className="checklist-item">
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onChange={() => toggleCheck(item.id)}
                  />
                  <span className="checklist-label">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Formulario de Notas de Seguridad */}
          <div className="doc-card card">
            <h3 className="doc-card-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              Bitácora de Observaciones
            </h3>

            <div className="doc-inputs">
              <div className="input-group">
                <label htmlFor="obs-input" className="input-label">Observaciones de seguridad y privacidad:</label>
                <textarea
                  id="obs-input"
                  rows={3}
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="doc-textarea"
                />
              </div>

              <div className="input-group">
                <label htmlFor="blue-input" className="input-label">Hallazgos para el análisis Blue Team:</label>
                <textarea
                  id="blue-input"
                  rows={3}
                  value={blueTeamFindings}
                  onChange={(e) => setBlueTeamFindings(e.target.value)}
                  className="doc-textarea"
                />
              </div>

              <button className="btn btn-primary btn-lg w-full" onClick={handleExportDocReport}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Exportar informe de laboratorio (.txt)
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
