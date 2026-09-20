import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { formatDateTime } from '../utils/dateUtils';
import { dataURLtoBlob } from '../utils/fileUtils';

const DB_NAME = 'ACA_CYBER_LAB_DB';
const DB_VERSION = 1;
const SESSIONS_STORE = 'sessions';
const AUDIT_STORE = 'audit_logs';
const LOCAL_STORAGE_KEY = 'aca_lab_sessions_backup';

/**
 * Obtiene o inicializa la conexión a IndexedDB
 */
function openDB() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      return reject(new Error('IndexedDB no soportado en este entorno.'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(SESSIONS_STORE)) {
        db.createObjectStore(SESSIONS_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(AUDIT_STORE)) {
        db.createObjectStore(AUDIT_STORE, { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

/**
 * Sincronización de respaldo en LocalStorage para garantizar que nunca se pierdan datos
 */
function getLocalBackup() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalBackup(sessionId, sessionObj) {
  try {
    const backup = getLocalBackup();
    // Guardar una versión serializable
    const safeCopy = {
      ...sessionObj,
      photos: (sessionObj.photos || []).map((p) => ({
        id: p.id,
        name: p.name,
        dataUrl: p.dataUrl,
        filter: p.filter,
        timestamp: p.timestamp,
        authorized: true,
      })),
      videos: (sessionObj.videos || []).map((v) => ({
        id: v.id,
        name: v.name,
        dataUrl: v.dataUrl || null,
        duration: v.duration,
        timestamp: v.timestamp,
        authorized: true,
      })),
    };
    backup[sessionId] = safeCopy;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(backup));
  } catch (err) {
    console.warn('LocalStorage backup failed:', err);
  }
}

/**
 * Genera un ID de sesión único con formato LAB-2026-XXXXXX
 */
export function generateSessionId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `LAB-2026-${code}`;
}

/**
 * Obtiene el ID de sesión activo actual o genera uno
 */
export function getActiveSessionId() {
  let id = sessionStorage.getItem('aca_current_session_id');
  if (!id) {
    id = generateSessionId();
    sessionStorage.setItem('aca_current_session_id', id);
  }
  return id;
}

/**
 * Crea o inicializa una sesión en IndexedDB (si ya existe, NO la sobrescribe)
 */
export async function createSession(sessionId) {
  const targetId = sessionId || getActiveSessionId();
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(SESSIONS_STORE, 'readwrite');
      const store = tx.objectStore(SESSIONS_STORE);
      const getReq = store.get(targetId);

      getReq.onsuccess = () => {
        if (getReq.result) {
          // Ya existe, preservar datos
          resolve(getReq.result);
          return;
        }

        // Revisar si existe en LocalStorage
        const backup = getLocalBackup();
        if (backup[targetId]) {
          store.put(backup[targetId]);
          resolve(backup[targetId]);
          return;
        }

        const newSession = {
          id: targetId,
          createdAt: new Date().toISOString(),
          status: 'in_progress',
          consent: {
            informedConsentAccepted: true,
            cameraAuthorized: false,
            locationAuthorized: false,
            acceptedAt: new Date().toISOString(),
          },
          photos: [],
          videos: [],
          locations: [],
          history: [
            {
              action: 'SESION_INICIADA',
              timestamp: new Date().toISOString(),
              details: 'Sesión creada en la experiencia visual del participante',
            },
          ],
        };

        const putReq = store.put(newSession);
        putReq.onsuccess = () => {
          saveLocalBackup(targetId, newSession);
          resolve(newSession);
        };
        putReq.onerror = () => {
          saveLocalBackup(targetId, newSession);
          resolve(newSession);
        };
      };

      getReq.onerror = () => {
        const backup = getLocalBackup();
        resolve(backup[targetId] || null);
      };
    });
  } catch {
    const backup = getLocalBackup();
    if (backup[targetId]) return backup[targetId];
    const newSession = {
      id: targetId,
      createdAt: new Date().toISOString(),
      status: 'in_progress',
      consent: {
        informedConsentAccepted: true,
        cameraAuthorized: false,
        locationAuthorized: false,
        acceptedAt: new Date().toISOString(),
      },
      photos: [],
      videos: [],
      locations: [],
      history: [],
    };
    saveLocalBackup(targetId, newSession);
    return newSession;
  }
}

/**
 * Obtiene una sesión por su ID
 */
export async function getSession(sessionId) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(SESSIONS_STORE, 'readonly');
      const store = tx.objectStore(SESSIONS_STORE);
      const req = store.get(sessionId);
      req.onsuccess = () => {
        if (req.result) {
          resolve(req.result);
        } else {
          const backup = getLocalBackup();
          resolve(backup[sessionId] || null);
        }
      };
      req.onerror = () => {
        const backup = getLocalBackup();
        resolve(backup[sessionId] || null);
      };
    });
  } catch {
    const backup = getLocalBackup();
    return backup[sessionId] || null;
  }
}

/**
 * Obtiene todas las sesiones registradas
 */
export async function getAllSessions() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(SESSIONS_STORE, 'readonly');
      const store = tx.objectStore(SESSIONS_STORE);
      const req = store.getAll();

      req.onsuccess = () => {
        const dbSessions = req.result || [];
        const backup = getLocalBackup();
        const map = new Map();

        // Cargar primero desde IndexedDB
        dbSessions.forEach((s) => {
          if (s && s.id) map.set(s.id, s);
        });

        // Combinar con LocalStorage por si hay alguna no sincronizada
        Object.values(backup).forEach((s) => {
          if (s && s.id) {
            const existing = map.get(s.id);
            if (!existing || (s.photos?.length > (existing.photos?.length || 0))) {
              map.set(s.id, s);
            }
          }
        });

        const list = Array.from(map.values());
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        resolve(list);
      };

      req.onerror = () => {
        const backup = getLocalBackup();
        const list = Object.values(backup);
        list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        resolve(list);
      };
    });
  } catch {
    const backup = getLocalBackup();
    const list = Object.values(backup);
    list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return list;
  }
}

/**
 * Guarda una fotografía autorizada en la sesión
 */
export async function savePhotoEvidence(sessionId, { blob, dataUrl, filter, filename }) {
  const targetId = sessionId || getActiveSessionId();
  await createSession(targetId);

  const photoItem = {
    id: `photo_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: filename || `FOTO_${targetId}_${Date.now()}.png`,
    blob: blob || (dataUrl ? dataURLtoBlob(dataUrl) : null),
    dataUrl: dataUrl || '',
    filter: filter || 'Normal',
    timestamp: new Date().toISOString(),
    authorized: true,
  };

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(SESSIONS_STORE, 'readwrite');
      const store = tx.objectStore(SESSIONS_STORE);
      const getReq = store.get(targetId);

      getReq.onsuccess = () => {
        let session = getReq.result;
        if (!session) {
          session = {
            id: targetId,
            createdAt: new Date().toISOString(),
            status: 'in_progress',
            consent: {
              informedConsentAccepted: true,
              cameraAuthorized: true,
              locationAuthorized: false,
              acceptedAt: new Date().toISOString(),
            },
            photos: [],
            videos: [],
            locations: [],
            history: [],
          };
        }

        session.photos = session.photos || [];
        session.photos.push(photoItem);
        session.consent = session.consent || {};
        session.consent.cameraAuthorized = true;
        session.history = session.history || [];
        session.history.push({
          action: 'FOTOGRAFIA_GUARDADA',
          timestamp: new Date().toISOString(),
          details: `Archivo ${photoItem.name} (${photoItem.filter})`,
        });

        store.put(session);
        saveLocalBackup(targetId, session);
        resolve(photoItem);
      };

      getReq.onerror = () => {
        saveLocalBackup(targetId, { id: targetId, photos: [photoItem] });
        resolve(photoItem);
      };
    });
  } catch {
    saveLocalBackup(targetId, { id: targetId, photos: [photoItem] });
    return photoItem;
  }
}

/**
 * Guarda un video autorizado en la sesión
 */
export async function saveVideoEvidence(sessionId, { blob, duration, filename, dataUrl }) {
  const targetId = sessionId || getActiveSessionId();
  await createSession(targetId);

  const videoItem = {
    id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: filename || `VIDEO_${targetId}_${Date.now()}.webm`,
    blob: blob || null,
    dataUrl: dataUrl || (blob ? URL.createObjectURL(blob) : null),
    duration: duration || 0,
    timestamp: new Date().toISOString(),
    authorized: true,
  };

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(SESSIONS_STORE, 'readwrite');
      const store = tx.objectStore(SESSIONS_STORE);
      const getReq = store.get(targetId);

      getReq.onsuccess = () => {
        let session = getReq.result;
        if (!session) {
          session = {
            id: targetId,
            createdAt: new Date().toISOString(),
            status: 'in_progress',
            consent: {
              informedConsentAccepted: true,
              cameraAuthorized: true,
              locationAuthorized: false,
              acceptedAt: new Date().toISOString(),
            },
            photos: [],
            videos: [],
            locations: [],
            history: [],
          };
        }

        session.videos = session.videos || [];
        session.videos.push(videoItem);
        session.consent = session.consent || {};
        session.consent.cameraAuthorized = true;
        session.history = session.history || [];
        session.history.push({
          action: 'VIDEO_GUARDADO',
          timestamp: new Date().toISOString(),
          details: `Archivo ${videoItem.name} (${videoItem.duration}s)`,
        });

        store.put(session);
        saveLocalBackup(targetId, session);
        resolve(videoItem);
      };

      getReq.onerror = () => {
        saveLocalBackup(targetId, { id: targetId, videos: [videoItem] });
        resolve(videoItem);
      };
    });
  } catch {
    saveLocalBackup(targetId, { id: targetId, videos: [videoItem] });
    return videoItem;
  }
}

/**
 * Guarda un registro de ubicación autorizado en la sesión
 */
export async function saveLocationEvidence(sessionId, locationData) {
  const targetId = sessionId || getActiveSessionId();
  await createSession(targetId);

  const locItem = {
    id: `loc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    latitude: locationData.latitude,
    longitude: locationData.longitude,
    accuracy: locationData.accuracy,
    altitude: locationData.altitude || null,
    timestamp: locationData.timestamp ? new Date(locationData.timestamp).toISOString() : new Date().toISOString(),
    authorized: true,
  };

  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(SESSIONS_STORE, 'readwrite');
      const store = tx.objectStore(SESSIONS_STORE);
      const getReq = store.get(targetId);

      getReq.onsuccess = () => {
        let session = getReq.result;
        if (!session) {
          session = {
            id: targetId,
            createdAt: new Date().toISOString(),
            status: 'in_progress',
            consent: {
              informedConsentAccepted: true,
              cameraAuthorized: false,
              locationAuthorized: true,
              acceptedAt: new Date().toISOString(),
            },
            photos: [],
            videos: [],
            locations: [],
            history: [],
          };
        }

        session.locations = session.locations || [];
        session.locations.push(locItem);
        session.consent = session.consent || {};
        session.consent.locationAuthorized = true;
        session.history = session.history || [];
        session.history.push({
          action: 'UBICACION_REGISTRADA',
          timestamp: new Date().toISOString(),
          details: `Lat: ${locItem.latitude}, Lon: ${locItem.longitude}, Precisión: ${locItem.accuracy}m`,
        });

        store.put(session);
        saveLocalBackup(targetId, session);
        resolve(locItem);
      };

      getReq.onerror = () => {
        saveLocalBackup(targetId, { id: targetId, locations: [locItem] });
        resolve(locItem);
      };
    });
  } catch {
    saveLocalBackup(targetId, { id: targetId, locations: [locItem] });
    return locItem;
  }
}

/**
 * Finaliza la sesión
 */
export async function completeSession(sessionId) {
  const targetId = sessionId || getActiveSessionId();
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(SESSIONS_STORE, 'readwrite');
      const store = tx.objectStore(SESSIONS_STORE);
      const getReq = store.get(targetId);

      getReq.onsuccess = () => {
        if (!getReq.result) return resolve(null);
        const session = getReq.result;
        session.status = 'completed';
        session.completedAt = new Date().toISOString();
        session.history = session.history || [];
        session.history.push({
          action: 'SESION_FINALIZADA',
          timestamp: new Date().toISOString(),
          details: 'El participante concluyó la experiencia',
        });
        store.put(session);
        saveLocalBackup(targetId, session);
        resolve(session);
      };
      getReq.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Actualiza el consentimiento de la sesión
 */
export async function updateSessionConsent(sessionId, consentUpdates) {
  const targetId = sessionId || getActiveSessionId();
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(SESSIONS_STORE, 'readwrite');
      const store = tx.objectStore(SESSIONS_STORE);
      const getReq = store.get(targetId);

      getReq.onsuccess = () => {
        let session = getReq.result;
        if (!session) {
          session = {
            id: targetId,
            createdAt: new Date().toISOString(),
            status: 'in_progress',
            consent: {
              informedConsentAccepted: true,
              cameraAuthorized: false,
              locationAuthorized: false,
              acceptedAt: new Date().toISOString(),
              ...consentUpdates,
            },
            photos: [],
            videos: [],
            locations: [],
            history: [],
          };
        } else {
          session.consent = {
            ...(session.consent || {}),
            ...consentUpdates,
          };
          session.history = session.history || [];
          session.history.push({
            action: 'CONSENTIMIENTO_ACTUALIZADO',
            timestamp: new Date().toISOString(),
            details: JSON.stringify(consentUpdates),
          });
        }
        store.put(session);
        saveLocalBackup(targetId, session);
        resolve(session);
      };
      getReq.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

/**
 * Elimina una sesión de forma segura y permanente
 */
export async function deleteSession(sessionId) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(SESSIONS_STORE, 'readwrite');
      const store = tx.objectStore(SESSIONS_STORE);
      store.delete(sessionId);
      const backup = getLocalBackup();
      delete backup[sessionId];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(backup));
      resolve(true);
    });
  } catch {
    const backup = getLocalBackup();
    delete backup[sessionId];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(backup));
    return true;
  }
}

/**
 * Registra un evento de auditoría
 */
export async function recordAuditLog(entry) {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(AUDIT_STORE, 'readwrite');
      const store = tx.objectStore(AUDIT_STORE);
      const log = {
        ...entry,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
      };
      store.add(log);
      resolve(true);
    });
  } catch {
    return false;
  }
}

/**
 * Obtiene todos los logs de auditoría
 */
export async function getAuditLogs() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(AUDIT_STORE, 'readonly');
      const store = tx.objectStore(AUDIT_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const logs = req.result || [];
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        resolve(logs);
      };
      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

/**
 * Genera el reporte de texto formal de ubicación
 */
export function generateLocationTxtReport(session, location) {
  const loc = location || (session.locations && session.locations[session.locations.length - 1]);
  if (!loc) return 'Sin datos de ubicación registrados.';

  return `════════════════════════════════════════════════════════════
REGISTRO DE UBICACIÓN — LABORATORIO ACADÉMICO ACA
════════════════════════════════════════════════════════════
Proyecto:      Laboratorio ACA CUN - Gestión de Incidentes
Sesión:        ${session.id}
Fecha y hora:  ${formatDateTime(new Date(loc.timestamp))}
Latitud:       ${loc.latitude}
Longitud:      ${loc.longitude}
Precisión:     ${loc.accuracy ? Number(loc.accuracy).toFixed(2) : 'N/A'} metros
Origen:        Geolocation API del Navegador
Autorización:  Registrada (Acción explícita del participante)
════════════════════════════════════════════════════════════
Este registro fue autorizado voluntariamente en el entorno
académico controlado de la Especialización en Ciberseguridad.
════════════════════════════════════════════════════════════
`;
}

/**
 * Exporta un paquete ZIP estructurado
 */
export async function exportSessionZip(session) {
  const zip = new JSZip();
  const root = zip.folder('evidencias').folder('sesiones').folder(session.id);
  const imgFolder = root.folder('imagenes');
  const vidFolder = root.folder('videos');
  const locFolder = root.folder('ubicacion');

  // 1. Imágenes
  if (session.photos && session.photos.length > 0) {
    session.photos.forEach((photo) => {
      if (photo.blob) {
        imgFolder.file(photo.name, photo.blob);
      } else if (photo.dataUrl) {
        imgFolder.file(photo.name, dataURLtoBlob(photo.dataUrl));
      }
    });
  }

  // 2. Videos
  if (session.videos && session.videos.length > 0) {
    session.videos.forEach((video) => {
      if (video.blob) {
        vidFolder.file(video.name, video.blob);
      }
    });
  }

  // 3. Ubicación
  if (session.locations && session.locations.length > 0) {
    session.locations.forEach((loc, idx) => {
      const txt = generateLocationTxtReport(session, loc);
      locFolder.file(`registro_ubicacion_${idx + 1}.txt`, txt);
    });
  }

  // 4. Metadata JSON
  const metadata = {
    sessionId: session.id,
    createdAt: session.createdAt,
    completedAt: session.completedAt || null,
    status: session.status,
    consent: session.consent,
    evidenceSummary: {
      photosCount: session.photos?.length || 0,
      videosCount: session.videos?.length || 0,
      locationsCount: session.locations?.length || 0,
    },
    locationsSummary: session.locations || [],
    history: session.history || [],
    environment: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
    },
  };

  root.file('metadata.json', JSON.stringify(metadata, null, 2));

  // Generar y descargar ZIP
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `evidencias_${session.id}.zip`);
}
