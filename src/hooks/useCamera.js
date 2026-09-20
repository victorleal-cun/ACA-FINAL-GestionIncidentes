import { useState, useCallback, useEffect } from 'react';
import { useLabContext } from '../context/LabContext';

export function useCamera() {
  const {
    cameraState,
    setCameraState,
    cameraStream,
    setCameraStream,
    cameraError,
    setCameraError,
    stopCamera,
  } = useLabContext();

  const [deviceInfo, setDeviceInfo] = useState({ label: '', width: 0, height: 0 });

  const requestCamera = useCallback(async () => {
    setCameraError('');
    setCameraState('requesting');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const err = 'Tu navegador no soporta el acceso a la cámara o no se ejecuta en un origen seguro (HTTPS/localhost).';
      setCameraError(err);
      setCameraState('error');
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
        audio: false,
      });

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        setDeviceInfo({
          label: videoTrack.label || 'Cámara web frontal / integrada',
          width: settings.width || 1280,
          height: settings.height || 720,
        });

        // Evento si el usuario desconecta o el sistema apaga la cámara
        videoTrack.onended = () => {
          stopCamera();
        };
      }

      setCameraStream(stream);
      setCameraState('active');
      return stream;
    } catch (error) {
      console.error('Error al solicitar cámara:', error);
      let friendlyMessage = 'No se pudo acceder a la cámara.';

      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        friendlyMessage = 'Permiso denegado por el usuario. Puedes habilitarlo en la configuración de permisos del navegador.';
        setCameraState('denied');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        friendlyMessage = 'No se detectó ningún dispositivo de cámara conectado a este equipo.';
        setCameraState('error');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        friendlyMessage = 'La cámara está siendo utilizada por otra aplicación o pestaña del navegador.';
        setCameraState('error');
      } else if (error.name === 'OverconstrainedError') {
        friendlyMessage = 'La resolución de video solicitada no es compatible con el dispositivo.';
        setCameraState('error');
      } else {
        friendlyMessage = `Error de acceso al dispositivo: ${error.message || 'desconocido'}`;
        setCameraState('error');
      }

      setCameraError(friendlyMessage);
      return null;
    }
  }, [setCameraError, setCameraState, setCameraStream, stopCamera]);

  return {
    cameraState,
    cameraStream,
    cameraError,
    deviceInfo,
    requestCamera,
    stopCamera,
    isActive: cameraState === 'active',
  };
}
