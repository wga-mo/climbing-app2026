"use client";

import { useCallback, useEffect, useState } from "react";

export function useUserLocation({
  enabled = true,
  watch = true,
} = {}) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState(null);

  const handleSuccess = useCallback((position) => {
    setLocation({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp,
    });

    setError(null);
    setLoading(false);
  }, []);

  const handleError = useCallback((geolocationError) => {
    let message = "Could not determine your location.";

    if (geolocationError.code === geolocationError.PERMISSION_DENIED) {
      message = "Location permission was denied.";
    }

    if (geolocationError.code === geolocationError.POSITION_UNAVAILABLE) {
      message = "Your location is currently unavailable.";
    }

    if (geolocationError.code === geolocationError.TIMEOUT) {
      message = "Finding your location took too long.";
    }

    setError(message);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setError("Location is not supported by this browser.");
      setLoading(false);
      return;
    }

    setLoading(true);

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    };

    if (watch) {
      const watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        options
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
      };
    }

    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      options
    );
  }, [enabled, watch, handleSuccess, handleError]);

  return {
    location,
    loading,
    error,
  };
}