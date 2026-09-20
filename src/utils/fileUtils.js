import { fileTimestamp, formatDateTime } from './dateUtils';

/**
 * Descarga un Blob como archivo
 */
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Descarga una imagen desde un data URL
 */
export function downloadDataURL(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Convierte un data URL a Blob
 */
export function dataURLtoBlob(dataUrl) {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const bytes = atob(parts[1]);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) {
    arr[i] = bytes.charCodeAt(i);
  }
  return new Blob([arr], { type: mime });
}

/**
 * Genera el contenido del registro de ubicación
 */
export function generateLocationReport(locationData) {
  if (!locationData) return null;

  const now = new Date(locationData.timestamp || Date.now());

  return `════════════════════════════════════════════════════════════
  REGISTRO DE UBICACIÓN — LABORATORIO ACADÉMICO
════════════════════════════════════════════════════════════

Proyecto:              Simulación Red Team / Blue Team
Empresa ficticia:      NovaConnect Solutions
Asignatura:            Gestión de Incidentes y Respuesta a Ciberataques
Institución:           Especialización en Ciberseguridad — CUN

────────────────────────────────────────────────────────────
  DATOS DE UBICACIÓN
────────────────────────────────────────────────────────────

Fecha y hora:          ${formatDateTime(now)}
Latitud:               ${locationData.latitude}
Longitud:              ${locationData.longitude}
Precisión reportada:   ${locationData.accuracy ? locationData.accuracy.toFixed(2) + ' metros' : 'No disponible'}
Altitud:               ${locationData.altitude ? locationData.altitude.toFixed(2) + ' metros' : 'No disponible'}
Origen:                Geolocation API del navegador

────────────────────────────────────────────────────────────
  CONSENTIMIENTO
────────────────────────────────────────────────────────────

Estado:                Autorizado por el participante
Método:                Acción voluntaria mediante botón en la interfaz
Procesamiento:         Local (navegador del participante)
Transmisión externa:   Ninguna

════════════════════════════════════════════════════════════
  Este archivo fue generado localmente como evidencia
  para un laboratorio académico de ciberseguridad.
  No contiene datos reales de producción.
════════════════════════════════════════════════════════════
`;
}

/**
 * Genera nombre de archivo con timestamp
 */
export function generateFilename(prefix, extension) {
  return `${prefix}_${fileTimestamp()}.${extension}`;
}
