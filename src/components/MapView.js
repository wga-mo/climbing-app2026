'use client';

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
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

function FitMapToMarkers({ markers }) {
  const map = useMap();

  useEffect(() => {
    if (!markers.length) return;

    const bounds = L.latLngBounds(
      markers.map(marker => [marker.lat, marker.lng])
    );

    map.fitBounds(bounds, {
      padding: [40, 40],
      maxZoom: 15,
    });
  }, [markers, map]);

  return null;
}

export default function MapView({
  markers,
  activeMarkerId,
  setActiveMarkerId,
  mode = "main",
}) {
  const router = useRouter();
  const markerRefs = useRef({});

  const isMainMap = mode === "main";
  const shouldFitMarkers = mode ==="detail" || mode === "fullscreen";

  const visibleMarkers = useMemo(
    () => markers.filter(marker => marker.lat && marker.lng),
    [markers]
  );

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

  return (
    <div
      className={
        isMainMap
        ? "h-[calc(100vh-6rem)] w-full overflow-hidden rounded border"
        : "h-full w-full overflow-hidden rounded"
      }
    >
      <MapContainer
        center={[59.9139, 10.7522]}
        zoom={8}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <ResizeMap />

        {shouldFitMarkers && (  <FitMapToMarkers markers={visibleMarkers} /> )}

        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
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