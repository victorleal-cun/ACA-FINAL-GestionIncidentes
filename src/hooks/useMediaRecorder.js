import { useState, useRef, useCallback, useEffect } from 'react';
import { useLabContext } from '../context/LabContext';
import { saveVideoEvidence } from '../services/storageService';

export function useMediaRecorder(streamOrCanvasSource) {
  const {
    recordingState,
    setRecordingState,
    recordingDuration,
    setRecordingDuration,
    recordedBlob,
    setRecordedBlob,
    addCapture,
  } = useLabContext();

  const [maxDuration, setMaxDuration] = useState(30); // 30 segundos
  const [recorderError, setRecorderError] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Determinar mimeType compatible
  const getSupportedMimeType = () => {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264',
      'video/webm',
      'video/mp4',
    ];
    for (const t of types) {
      if (MediaRecorder.isTypeSupported(t)) {
        return t;
      }
    }
    return '';
  };

  const stopRecording = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error('Error al detener MediaRecorder:', e);
      }
    }
  }, []);

  const startRecording = useCallback((sourceStreamOrCanvas) => {
    setRecorderError('');
    chunksRef.current = [];

    if (!window.MediaRecorder) {
      setRecorderError('Tu navegador no es compatible con la API MediaRecorder.');
      setRecordingState('error');
      return;
    }

    let stream = sourceStreamOrCanvas;
    if (sourceStreamOrCanvas && typeof sourceStreamOrCanvas.captureStream === 'function') {
      try {
        stream = sourceStreamOrCanvas.captureStream(30);
      } catch (err) {
        console.error('Error al capturar stream de canvas:', err);
      }
    }

    if (!stream || (!stream.active && !(stream instanceof MediaStream))) {
      setRecorderError('No hay una fuente de video activa para iniciar la grabación.');
      return;
    }

    const mimeType = getSupportedMimeType();
    if (!mimeType) {
      setRecorderError('No se encontró un códec de grabación compatible en este navegador.');
      setRecordingState('error');
      return;
    }

    try {
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 2500000, // 2.5 Mbps
      });

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const videoUrl = URL.createObjectURL(blob);
        const currentSessionId = sessionStorage.getItem('aca_current_session_id') || null;
        const videoName = `VIDEO_${currentSessionId || 'LAB'}_${Date.now()}.${mimeType.includes('mp4') ? 'mp4' : 'webm'}`;
        const videoData = {
          blob,
          url: videoUrl,
          duration: recordingDuration,
          mimeType,
          timestamp: Date.now(),
          type: 'video',
          name: videoName,
        };

        setRecordedBlob(videoData);
        addCapture(videoData);
        try {
          await saveVideoEvidence(currentSessionId, {
            blob,
            duration: recordingDuration,
            filename: videoName,
          });
        } catch (err) {
          console.error('Error guardando video en storage:', err);
        }
        setRecordingState('stopped');
      };

      recorder.onerror = (e) => {
        console.error('Error en MediaRecorder:', e);
        setRecorderError('Ocurrió una interrupción durante la grabación de video.');
        setRecordingState('error');
      };

      recorder.start(500); // Guardar fragmentos cada 500ms
      mediaRecorderRef.current = recorder;
      setRecordingState('recording');
      setRecordingDuration(0);

      // Iniciar contador
      const startTime = Date.now();
      timerIntervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setRecordingDuration(elapsed);

        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 500);
    } catch (err) {
      console.error('Error al inicializar MediaRecorder:', err);
      setRecorderError(`Error de grabación: ${err.message || 'desconocido'}`);
      setRecordingState('error');
    }
  }, [maxDuration, recordingDuration, setRecordingDuration, setRecordingState, setRecordedBlob, addCapture, stopRecording]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  // Limpiar grabación anterior
  const clearRecording = useCallback(() => {
    if (recordedBlob?.url) {
      try { URL.revokeObjectURL(recordedBlob.url); } catch {}
    }
    setRecordedBlob(null);
    setRecordingState('idle');
    setRecordingDuration(0);
    chunksRef.current = [];
  }, [recordedBlob, setRecordedBlob, setRecordingState, setRecordingDuration]);

  return {
    recordingState,
    recordingDuration,
    recordedBlob,
    recorderError,
    maxDuration,
    setMaxDuration,
    startRecording,
    stopRecording,
    clearRecording,
    isRecording: recordingState === 'recording',
  };
}
