'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, ZoomControl, Polyline } from "react-leaflet";
import { useRouter } from "next/navigation";

function getParkingLabel(type) {
  if (type === "parking") return "P";

  const match = type.match(/^parking[-_](\d+)$/);
  if (match) return `P${match[1]}`;

  return "P";
}

function getMarkerIcon(marker) {
  if (marker.type?.startsWith("parking")) {
    return L.divIcon({
      className: "custom-marker parking-marker",
      html: `<span>${getParkingLabel(marker.type)}</span>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28],
    });
  }

  if (marker.type === "sector" || marker.type === "wall") {
    return L.divIcon({
      className: "custom-marker sector-marker",
      html: `<span>S</span>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28],
    });
  }

  if (marker.type === "crag") {
    return L.divIcon({
      className: "custom-marker crag-marker",
      html: `<span>C</span>`,
      iconSize: [28, 28],
      iconAnchor: [14, 28],
      popupAnchor: [0, -28],
    });
  }

  return L.divIcon({
    className: "custom-marker crag-marker",
    html: "<span>•</span>",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

function FitMapToContent({ markers, paths }) {
  const map = useMap();

  useEffect(() => {
    const positions = [
      ...markers.map(marker => [marker.lat, marker.lng]),
      ...paths.flatMap(path => path.positions),
    ];

    if (!positions.length) return;

    const bounds = L.latLngBounds(positions);

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 15,
    });
  }, [markers, paths, map]);

  return null;
}

function getLocationErrorMessage(error) {
  const message = error?.message || "";

  if (message.toLowerCase().includes("denied")) {
    return "Location access is blocked. Allow location access in your browser's site settings and try again.";
  }

  if (message.toLowerCase().includes("unavailable")) {
    return "Your location is currently unavailable.";
  }

  if (message.toLowerCase().includes("timeout")) {
    return "Finding your location took too long. Try again.";
  }

  return "Could not determine your location.";
}

function LocateControl({
  enabled,
  onLocationError,
  onLocationFound,
  controlRef,
}) {
  const map = useMap();

  useEffect(() => {
    if (!enabled) return;

    let control;
    let cancelled = false;

    function handleLocationFound() {
      onLocationFound?.();
    }

    function handleLocationError(error) {
      onLocationError?.(getLocationErrorMessage(error));
    }

    async function addLocateControl() {
      const { LocateControl: LeafletLocateControl } = await import(
        "leaflet.locatecontrol"
      );

      if (cancelled) return;

      control = new LeafletLocateControl({
        position: "bottomright",
        flyTo: true,
        setView: "untilPanOrZoom",
        keepCurrentZoomLevel: false,
        drawCircle: true,
        drawMarker: true,
        showCompass: true,
        showPopup: false,
        cacheLocation: true,
        metric: true,
        strings: {
          title: "Show my location",
        },
        locateOptions: {
          enableHighAccuracy: true,
          watch: true,
          maximumAge: 10000,
          timeout: 15000,
        },
        onLocationError: handleLocationError,
      }).addTo(map);

      if (controlRef) {
        controlRef.current = control;
      }
    }

    map.on("locationfound", handleLocationFound);

    addLocateControl();

    return () => {
      cancelled = true;
      map.off("locationfound", handleLocationFound);

      if (controlRef?.current === control) {
        controlRef.current = null;
      }

      if (control) {
        control.remove();
      }
    };
  }, [
    map,
    enabled,
    onLocationError,
    onLocationFound,
    controlRef,
  ]);

  return null;
}

export default function MapView({
  markers,
  paths = [],
  activeMarkerId,
  setActiveMarkerId,
  mode = "main",
}) {
  console.log("Paths in MapView:", paths);

  const router = useRouter();
  const markerRefs = useRef({});
  const locateControlRef = useRef(null);
  const [locationError, setLocationError] = useState(null);
  const [locationRetrying, setLocationRetrying] = useState(false);

  const isMainMap = mode === "main";
  const isFullscreenMap = mode === "fullscreen";

  const shouldFitMarkers = mode ==="detail" || mode === "fullscreen";

  const visibleMarkers = useMemo(
    () => markers.filter(marker => marker.lat && marker.lng),
    [markers]
  );

  const visiblePaths = useMemo(() => {
    return paths
      .map(path => {
        const geojson = path.geometry;

        const line =
          geojson?.type === "Feature"
            ? geojson.geometry
            : geojson;

        if (
          line?.type !== "LineString" ||
          !Array.isArray(line.coordinates)
        ) {
          return null;
        }

        const positions = line.coordinates
          .filter(
            coordinate =>
              Array.isArray(coordinate) &&
              coordinate.length >= 2 &&
              Number.isFinite(Number(coordinate[0])) &&
              Number.isFinite(Number(coordinate[1]))
          )
          .map(([lng, lat]) => [
            Number(lat),
            Number(lng),
          ]);

        if (positions.length < 2) {
          return null;
        }

        return {
          ...path,
          positions,
        };
      })
      .filter(Boolean);
  }, [paths]);

  useEffect(() => {
    if (!activeMarkerId) return;

    const marker = markerRefs.current[activeMarkerId];

    if (marker) {
      marker.openPopup();
    }
  }, [activeMarkerId]);

  function ResizeMap() {
    const map = useMap();

    useEffect(() => {
      const timeoutId = setTimeout(() => {
        if (map && map.getContainer()) {
          map.invalidateSize();
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }, [map]);

    return null;
  }

  const handleLocationError = useCallback((message) => {
    setLocationRetrying(false);
    setLocationError(message);
  }, []);

  const handleLocationFound = useCallback(() => {
    setLocationRetrying(false);
    setLocationError(null);
  }, []);

  function retryLocation() {
    const control = locateControlRef.current;

    setLocationRetrying(true);

    if (!control) {
      setLocationRetrying(false);
      setLocationError("Location control is not ready yet.");
      return;
    }

    control.stop?.();

    window.setTimeout(() => {
      setLocationError(null);
      control.start?.();
    }, 150);

    window.setTimeout(() => {
      setLocationRetrying(false);
    }, 5000);
  }

  return (
    <div
      className={
        isFullscreenMap
        ? "relative h-full w-full overflow-hidden"
        :  isMainMap
          ? "h-[calc(100vh-6rem)] w-full overflow-hidden rounded border"
          : "h-full w-full overflow-hidden rounded"
      }
    >

      {isFullscreenMap && locationError && (
        <div className="absolute bottom-3 left-3 z-[1000] max-w-[calc(100%-5rem)] rounded-md border bg-white p-3 text-sm shadow">
          <div>{locationError}</div>

          <button
            type="button"
            onClick={retryLocation}
            disabled={locationRetrying}
            className="mt-2 rounded bg-gray-900 px-3 py-1.5 text-white hover:bg-gray-700 disabled:cursor-wait disabled:opacity-60"
          >
            {locationRetrying ? "Trying..." : "Try again"}
          </button>
        </div>
      )}

      <MapContainer
        center={[59.9139, 10.7522]}
        zoom={8}
        zoomControl={false}
        scrollWheelZoom
        className="h-full w-full"
        
      >
        <ResizeMap />

        {shouldFitMarkers && (  <FitMapToContent markers={visibleMarkers} paths={visiblePaths} /> )}

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {visiblePaths.map(path => (
          <Polyline
            key={path.path_id}
            positions={path.positions}
            pathOptions={{
              color: "#2563eb",
              weight: 5,
              opacity: 0.9,
              lineCap: "round",
              lineJoin: "round",
            }}
          >
            <Tooltip sticky>
              {path.name || "Approach"}
            </Tooltip>
          </Polyline>
        ))}
        
        <ZoomControl position="bottomright" />

        <LocateControl
          enabled={isFullscreenMap}
          controlRef={locateControlRef}
          onLocationError={handleLocationError}
          onLocationFound={handleLocationFound}
        />

        {visibleMarkers.map(marker => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={getMarkerIcon(marker)}
            ref={ref => {
              if (ref) {
                markerRefs.current[marker.id] = ref;
              } else {
                delete markerRefs.current[marker.id];
              }
            }}
            eventHandlers={{
              click: () => {
                if (marker.href) {
                  router.push(marker.href);
                }
              },
              mouseover: event => {
                setActiveMarkerId?.(marker.id);
                event.target.openPopup();
              },
              mouseout: event => {
                setActiveMarkerId?.(null);
                event.target.closePopup();
              },
            }}
          >
            {marker.type === "sector"  ? (
              <Tooltip
                permanent
                direction="top"
                offset={[0, -10]}
                className="sector-label"
              >
                {marker.label}
              </Tooltip>
            ) : (
              <Popup>
                {marker.label}
              </Popup>
            )}
          </Marker>
        ))}

       
          </MapContainer>
    </div>
  );
}