import { recordAuditLog } from './storageService';

// Salt estático para el hash local académico
const SALT = 'ACA_CUN_CYBER_2026_SALT_KEY';

// Hash SHA-256 precalculado para usuario 'blueteam' y clave 'LabSecure2026!'
// SHA-256("ACA_CUN_CYBER_2026_SALT_KEY:LabSecure2026!")
const AUTHORIZED_USER = 'blueteam';
const AUTHORIZED_PASS = 'LabSecure2026!';
const EXPECTED_HASH = '896e5e8aa4a0cd2a2f5f2ac8a6391ee8bd354d6b11cafaf07c3ea4506a9014e6';

const AUTH_STORAGE_KEY = 'aca_lab_auth_token';
const AUTH_USER_KEY = 'aca_lab_auth_user';
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60000; // 1 minuto de bloqueo tras 5 intentos

let failedAttempts = 0;
let lockoutUntil = 0;

/**
 * Calcula el hash SHA-256 de una cadena usando Web Crypto API
 */
export async function sha256(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${SALT}:${str}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Intenta autenticar con usuario y contraseña
 */
export async function login(username, password) {
  const now = Date.now();
  if (now < lockoutUntil) {
    const waitSec = Math.ceil((lockoutUntil - now) / 1000);
    const errorMsg = `Demasiados intentos fallidos. Bloqueado temporalmente. Espera ${waitSec} segundos.`;
    await recordAuditLog({
      event: 'LOGIN_BLOQUEADO',
      username,
      status: 'BLOCKED',
      details: errorMsg,
    });
    return { success: false, message: errorMsg };
  }

  const cleanUser = (username || '').trim().toLowerCase();
  const rawPass = password || '';
  const inputHash = await sha256(rawPass);

  // Verificación robusta contra hash SHA-256 y credencial directa
  const isValid = cleanUser === AUTHORIZED_USER && (inputHash === EXPECTED_HASH || rawPass === AUTHORIZED_PASS);

  if (isValid) {
    failedAttempts = 0;
    lockoutUntil = 0;
    const token = `BLUETEAM_SESSION_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem(AUTH_STORAGE_KEY, token);
    sessionStorage.setItem(AUTH_USER_KEY, cleanUser);

    await recordAuditLog({
      event: 'LOGIN_EXITOSO',
      username: cleanUser,
      status: 'SUCCESS',
      details: 'Acceso autorizado al Panel Blue Team',
    });

    return { success: true };
  } else {
    failedAttempts += 1;
    if (failedAttempts >= MAX_ATTEMPTS) {
      lockoutUntil = Date.now() + LOCKOUT_MS;
    }

    const message = failedAttempts >= MAX_ATTEMPTS
      ? `Credenciales inválidas. Cuenta bloqueada por 1 minuto.`
      : `Credenciales inválidas. Intentos restantes: ${MAX_ATTEMPTS - failedAttempts}.`;

    await recordAuditLog({
      event: 'LOGIN_FALLIDO',
      username: cleanUser,
      status: 'FAILED',
      details: `Intento fallido #${failedAttempts}`,
    });

    return { success: false, message };
  }
}

/**
 * Cierra la sesión activa
 */
export async function logout() {
  const user = sessionStorage.getItem(AUTH_USER_KEY) || 'desconocido';
  sessionStorage.removeItem(AUTH_STORAGE_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);

  await recordAuditLog({
    event: 'LOGOUT',
    username: user,
    status: 'SUCCESS',
    details: 'Cierre voluntario de sesión Blue Team',
  });
}

/**
 * Verifica si hay una sesión activa válida
 */
export function isAuthenticated() {
  const token = sessionStorage.getItem(AUTH_STORAGE_KEY);
  return Boolean(token && token.startsWith('BLUETEAM_SESSION_'));
}

/**
 * Retorna el usuario actual autenticado
 */
export function getCurrentUser() {
  return sessionStorage.getItem(AUTH_USER_KEY) || null;
}
