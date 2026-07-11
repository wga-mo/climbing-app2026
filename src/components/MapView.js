'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Tooltip,
  useMap,
  useMapEvents,
  ZoomControl,
  Polyline,
} from "react-leaflet";
import { useRouter } from "next/navigation";
import MapStyleControl from "@/components/MapStyleControl";

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
    return "Location access is blocked. Allow location access in your phone's or browser's settings and try again.";
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

function PathDrawingHandler({ enabled, onAddPoint }) {
  useMapEvents({
    click(event) {
      if (!enabled) return;

      onAddPoint([
        event.latlng.lat,
        event.latlng.lng,
      ]);
    },
  });

  return null;
}

function getLocationButtonLabel(marker) {
  if (marker.type === "crag") {
    return marker.label || "Crag";
  }

  if (marker.type?.startsWith("parking")) {
    return getParkingLabel(marker.type);
  }

  if (marker.type === "sector") {
    return marker.label || "Sector";
  }

  if (marker.type === "wall") {
    return marker.label || "Wall";
  }

  return marker.label || marker.type || "Location";
}

export default function MapView({
  markers,
  paths = [],
  activeMarkerId,
  setActiveMarkerId,
  mode = "main",

  isAdmin = false,
  onSavePath,
}) {
  console.log("Paths in MapView:", paths);

  const router = useRouter();
  const markerRefs = useRef({});
  const locateControlRef = useRef(null);
  const [locationError, setLocationError] = useState(null);
  const [locationRetrying, setLocationRetrying] = useState(false);

  //About drawing paths
  const [isDrawingPath, setIsDrawingPath] = useState(false);
  const [draftPathPoints, setDraftPathPoints] = useState([]);
  const [draftPathName, setDraftPathName] = useState("");
  const [savingPath, setSavingPath] = useState(false);
  const [pathSaveError, setPathSaveError] = useState(null);

  const isMainMap = mode === "main";
  const isFullscreenMap = mode === "fullscreen";

  const shouldFitMarkers = mode ==="detail" || mode === "fullscreen";

  const visibleMarkers = useMemo(
    () => markers.filter(marker => marker.lat && marker.lng),
    [markers]
  );

  const selectableLocations = useMemo(() => {
    return visibleMarkers.filter(marker =>
      [
        "crag",
        "parking",
        "sector",
        "wall",
      ].includes(marker.type) ||
      marker.type?.startsWith("parking")
    );
  }, [visibleMarkers]);

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

  function addDraftPoint(point) {
    setDraftPathPoints(points => {
      const lastPoint = points.at(-1);

      if (
        lastPoint &&
        lastPoint[0] === point[0] &&
        lastPoint[1] === point[1]
      ) {
        return points;
      }

      return [...points, point];
    });
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
      {/* Show location error message in fullscreen mode */}
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

      {/* Draw approach button for admins in fullscreen mode */}
      {isFullscreenMap && isAdmin && !isDrawingPath && (
        <button
          type="button"
          onClick={() => {
            setDraftPathPoints([]);
            setDraftPathName("");
            setPathSaveError(null);
            setIsDrawingPath(true);
          }}
          className="absolute right-3 top-3 z-[1000] rounded-md border bg-white px-3 py-2 text-sm shadow hover:bg-gray-50"
        >
          Draw path
        </button>
      )}

      {/* Controls while drawing a path */}
      {isFullscreenMap && isAdmin && isDrawingPath && (
        <div className="absolute right-3 top-3 z-[1000] max-h-[calc(100%-1.5rem)] w-[min(22rem,calc(100%-1.5rem))] overflow-y-auto rounded-md border bg-white p-3 shadow">
          <label className="block text-sm font-medium">
            Path name
          </label>

          <input
            type="text"
            value={draftPathName}
            onChange={event => {
              setDraftPathName(event.target.value);
            }}
            placeholder="For example: P1 to main crag"
            className="mt-1 w-full rounded border px-3 py-2 text-sm"
          />

          <div className="mt-3 text-sm">
            Click the map to add points, or add a known location:
          </div>

          {selectableLocations.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectableLocations.map(marker => (
                <button
                  key={marker.id}
                  type="button"
                  onClick={() => {
                    addDraftPoint([marker.lat, marker.lng]);
                  }}
                  className="rounded border bg-white px-2.5 py-1.5 text-sm hover:bg-gray-50"
                >
                  + {getLocationButtonLabel(marker)}
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setDraftPathPoints(points =>
                  points.slice(0, -1)
                );
              }}
              disabled={draftPathPoints.length === 0}
              className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Undo
            </button>

            <button
              type="button"
              onClick={() => {
                setDraftPathPoints([]);
              }}
              disabled={draftPathPoints.length === 0}
              className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Clear
            </button>

            <button
              type="button"
              onClick={() => {
                setDraftPathPoints([]);
                setDraftPathName("");
                setPathSaveError(null);
                setIsDrawingPath(false);
              }}
              disabled={savingPath}
              className="rounded border px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={async () => {
                const trimmedName = draftPathName.trim();

                if (
                  draftPathPoints.length < 2 ||
                  !trimmedName ||
                  !onSavePath
                ) {
                  return;
                }

                setSavingPath(true);
                setPathSaveError(null);

                try {
                  await onSavePath({
                    name: trimmedName,
                    points: draftPathPoints,
                  });

                  setDraftPathPoints([]);
                  setDraftPathName("");
                  setIsDrawingPath(false);
                } catch (error) {
                  console.error("Could not save path:", error);

                  setPathSaveError(
                    error?.message || "Could not save path."
                  );
                } finally {
                  setSavingPath(false);
                }
              }}
              disabled={
                draftPathPoints.length < 2 ||
                !draftPathName.trim() ||
                savingPath ||
                !onSavePath
              }
              className="rounded bg-gray-900 px-3 py-1.5 text-sm text-white hover:bg-gray-700 disabled:opacity-50"
            >
              {savingPath ? "Saving..." : "Save"}
            </button>
          </div>

          <div className="mt-2 text-xs text-gray-500">
            {draftPathPoints.length} points
          </div>

          {pathSaveError && (
            <div className="mt-2 text-sm text-red-700">
              {pathSaveError}
            </div>
          )}
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

        <PathDrawingHandler
          enabled={isDrawingPath}
          onAddPoint={addDraftPoint}
        />

        {shouldFitMarkers && (  <FitMapToContent markers={visibleMarkers} paths={visiblePaths} /> )}

        <MapStyleControl />

        {draftPathPoints.length >= 2 && (
          <Polyline
            positions={draftPathPoints}
            pathOptions={{
              color: "#dc2626",
              weight: 5,
              opacity: 0.9,
              dashArray: "8 8",
              lineCap: "round",
              lineJoin: "round",
            }}
          />
        )}

        {draftPathPoints.map((point, index) => (
          <Marker
            key={`${point[0]}-${point[1]}-${index}`}
            position={point}
            icon={L.divIcon({
              className: "",
              html: `
                <div
                  style="
                    width: 12px;
                    height: 12px;
                    border: 2px solid white;
                    border-radius: 9999px;
                    background: #dc2626;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.5);
                  "
                ></div>
              `,
              iconSize: [12, 12],
              iconAnchor: [6, 6],
            })}
          />
        ))}

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