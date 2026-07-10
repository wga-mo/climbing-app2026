"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useUserLocation({
  enabled = false,
  watch = true,
} = {}) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionState, setPermissionState] = useState("unknown");

  const watchIdRef = useRef(null);

  const stopWatching = useCallback(() => {
    if (
      watchIdRef.current !== null &&
      typeof navigator !== "undefined" &&
      navigator.geolocation
    ) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const handleSuccess = useCallback((position) => {
    setLocation({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      heading: position.coords.heading,
      speed: position.coords.speed,
      timestamp: position.timestamp,
    });

    setPermissionState("granted");
    setError(null);
    setLoading(false);
  }, []);

  const handleError = useCallback((geolocationError) => {
    let message = "Could not determine your location.";

    if (geolocationError.code === geolocationError.PERMISSION_DENIED) {
      setPermissionState("denied");
      message =
        "Location access is blocked. Allow location access in your browser's site settings and try again.";
    } else if (
      geolocationError.code === geolocationError.POSITION_UNAVAILABLE
    ) {
      message = "Your location is currently unavailable.";
    } else if (geolocationError.code === geolocationError.TIMEOUT) {
      message = "Finding your location took too long. Try again.";
    }

    setError(message);
    setLoading(false);
  }, []);

  const requestLocation = useCallback(() => {
    if (
      typeof navigator === "undefined" ||
      !navigator.geolocation
    ) {
      setError("Location is not supported by this browser.");
      setLoading(false);
      return;
    }

    stopWatching();

    setLoading(true);
    setError(null);

    const options = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    };

    if (watch) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        options
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        options
      );
    }
  }, [
    watch,
    stopWatching,
    handleSuccess,
    handleError,
  ]);

  useEffect(() => {
    if (enabled) {
      requestLocation();
    }

    return stopWatching;
  }, [enabled, requestLocation, stopWatching]);

  return {
    location,
    loading,
    error,
    permissionState,
    requestLocation,
    stopWatching,
  };
}