/**
 * Utilidades de fecha y hora
 */

/**
 * Formatea una fecha como string legible en español
 */
export function formatDateTime(dateInput) {
  try {
    if (!dateInput) return 'Fecha no disponible';
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    if (isNaN(date.getTime())) return 'Fecha no disponible';
    return date.toLocaleString('es-CO', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return 'Fecha no disponible';
  }
}

/**
 * Genera un timestamp para nombres de archivo (YYYYMMDD_HHmmss)
 */
export function fileTimestamp(dateInput = new Date()) {
  try {
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
    const validDate = isNaN(date.getTime()) ? new Date() : date;
    const y = validDate.getFullYear();
    const m = String(validDate.getMonth() + 1).padStart(2, '0');
    const d = String(validDate.getDate()).padStart(2, '0');
    const h = String(validDate.getHours()).padStart(2, '0');
    const min = String(validDate.getMinutes()).padStart(2, '0');
    const s = String(validDate.getSeconds()).padStart(2, '0');
    return `${y}${m}${d}_${h}${min}${s}`;
  } catch {
    return `${Date.now()}`;
  }
}

/**
 * Formatea segundos como MM:SS
 */
export function formatDuration(seconds) {
  const sec = Number(seconds) || 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
