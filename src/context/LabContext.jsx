import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const LabContext = createContext(null);

export function LabProvider({ children }) {
  // Camera state
  const [cameraState, setCameraState] = useState('idle'); // idle | requesting | active | denied | error | stopped
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraError, setCameraError] = useState('');

  // Recording state
  const [recordingState, setRecordingState] = useState('idle'); // idle | recording | stopped | error
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState(null);

  // Location state
  const [locationState, setLocationState] = useState('idle'); // idle | requesting | granted | denied | error | tracking
  const [locationData, setLocationData] = useState(null);
  const [locationHistory, setLocationHistory] = useState([]);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef(null);

  // Captures
  const [captures, setCaptures] = useState([]);
  const [downloadCount, setDownloadCount] = useState(0);

  // Active effects
  const [activeEffects, setActiveEffects] = useState([]);

  // Add capture
  const addCapture = useCallback((captureData) => {
    setCaptures(prev => [...prev, captureData]);
  }, []);

  // Remove capture
  const removeCapture = useCallback((index) => {
    setCaptures(prev => {
      const updated = [...prev];
      if (updated[index]?.url) {
        URL.revokeObjectURL(updated[index].url);
      }
      updated.splice(index, 1);
      return updated;
    });
  }, []);

  // Clear all captures
  const clearCaptures = useCallback(() => {
    setCaptures(prev => {
      prev.forEach(c => {
        if (c.url) URL.revokeObjectURL(c.url);
      });
      return [];
    });
  }, []);

  // Increment download count
  const incrementDownloads = useCallback(() => {
    setDownloadCount(prev => prev + 1);
  }, []);

  // Stop camera
  const stopCamera = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setCameraState('stopped');
    setCameraError('');
  }, [cameraStream]);

  // Stop location tracking
  const stopLocationTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
    if (locationState === 'tracking') {
      setLocationState('granted');
    }
  }, [locationState]);

  // Reset everything
  const resetAll = useCallback(() => {
    stopCamera();
    stopLocationTracking();
    clearCaptures();
    setCameraState('idle');
    setCameraError('');
    setRecordingState('idle');
    setRecordingDuration(0);
    if (recordedBlob?.url) URL.revokeObjectURL(recordedBlob.url);
    setRecordedBlob(null);
    setLocationState('idle');
    setLocationData(null);
    setLocationHistory([]);
    setDownloadCount(0);
    setActiveEffects([]);
  }, [stopCamera, stopLocationTracking, clearCaptures, recordedBlob]);

  const value = {
    // Camera
    cameraState, setCameraState,
    cameraStream, setCameraStream,
    cameraError, setCameraError,
    stopCamera,

    // Recording
    recordingState, setRecordingState,
    recordingDuration, setRecordingDuration,
    recordedBlob, setRecordedBlob,

    // Location
    locationState, setLocationState,
    locationData, setLocationData,
    locationHistory, setLocationHistory,
    isTracking, setIsTracking,
    watchIdRef,
    stopLocationTracking,

    // Captures
    captures,
    addCapture,
    removeCapture,
    clearCaptures,

    // Downloads
    downloadCount,
    incrementDownloads,

    // Effects
    activeEffects, setActiveEffects,

    // Global
    resetAll,
  };

  return (
    <LabContext.Provider value={value}>
      {children}
    </LabContext.Provider>
  );
}

export function useLabContext() {
  const context = useContext(LabContext);
  if (!context) {
    throw new Error('useLabContext must be used within a LabProvider');
  }
  return context;
}
