'use client';

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useRouter } from "next/navigation";

const defaultIcon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const parkingIcon = L.icon({
  iconUrl: "/leaflet/icon-parking.svg",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function getMarkerIcon(marker) {
  if (marker.type === "parking") {
    return parkingIcon;
  }

  return defaultIcon;
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
  detailView=false,
}) {
  const router = useRouter();
  const markerRefs = useRef({});

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
        detailView
          ? "h-full w-full overflow-hidden rounded"
          : "h-[calc(100vh-6rem)] w-full overflow-hidden rounded border"
      }
    >
      <MapContainer
        center={[59.9139, 10.7522]}
        zoom={8}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <ResizeMap />

        {detailView && (  <FitMapToMarkers markers={visibleMarkers} /> )}

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
              if (ref) markerRefs.current[marker.id] = ref;
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
            <Popup autoPan={false}>
              {marker.label}
            </Popup>
          </Marker>
        ))}
          </MapContainer>
    </div>
  );
}