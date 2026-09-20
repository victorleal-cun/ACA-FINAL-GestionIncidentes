import { useState, useCallback, useEffect } from 'react';
import { useLabContext } from '../context/LabContext';
import { saveLocationEvidence } from '../services/storageService';

export function useGeolocation() {
  const {
    locationState,
    setLocationState,
    locationData,
    setLocationData,
    locationHistory,
    setLocationHistory,
    isTracking,
    setIsTracking,
    watchIdRef,
    stopLocationTracking,
  } = useLabContext();

  const [locationError, setLocationError] = useState('');

  const parsePosition = (position) => {
    const coords = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      accuracy: position.coords.accuracy,
      altitude: position.coords.altitude,
      speed: position.coords.speed,
      heading: position.coords.heading,
      timestamp: position.timestamp || Date.now(),
    };
    return coords;
  };

  const handleGeoError = (error) => {
    let msg = 'Error desconocido al consultar la ubicación.';
    if (error.code === 1) { // PERMISSION_DENIED
      msg = 'Permiso de ubicación denegado por el usuario. La solicitud fue rechazada de forma explícita.';
      setLocationState('denied');
    } else if (error.code === 2) { // POSITION_UNAVAILABLE
      msg = 'Información de ubicación no disponible. Verifica la señal GPS o conectividad de red.';
      setLocationState('error');
    } else if (error.code === 3) { // TIMEOUT
      msg = 'Tiempo de espera agotado al consultar las coordenadas satelitales/red.';
      setLocationState('error');
    }
    setLocationError(msg);
  };

  // Solicitar ubicación puntual
  const requestLocation = useCallback(() => {
    setLocationError('');
    setLocationState('requesting');

    if (!('geolocation' in navigator)) {
      setLocationError('Tu navegador no cuenta con soporte para la Geolocation API.');
      setLocationState('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = parsePosition(pos);
        setLocationData(coords);
        setLocationHistory((prev) => [coords, ...prev.slice(0, 9)]);
        setLocationState('granted');
        saveLocationEvidence(null, coords);
      },
      (err) => {
        handleGeoError(err);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, [setLocationData, setLocationHistory, setLocationState]);

  // Iniciar seguimiento periódico explícito
  const startTracking = useCallback(() => {
    setLocationError('');
    if (!('geolocation' in navigator)) {
      setLocationError('Tu navegador no cuenta con soporte para la Geolocation API.');
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setLocationState('tracking');
    setIsTracking(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = parsePosition(pos);
        setLocationData(coords);
        setLocationHistory((prev) => [coords, ...prev.slice(0, 9)]);
      },
      (err) => {
        handleGeoError(err);
        stopLocationTracking();
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 5000,
      }
    );
  }, [setLocationData, setLocationHistory, setLocationState, setIsTracking, watchIdRef, stopLocationTracking]);

  return {
    locationState,
    locationData,
    locationHistory,
    locationError,
    isTracking,
    requestLocation,
    startTracking,
    stopTracking: stopLocationTracking,
  };
}
