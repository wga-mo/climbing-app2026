'use client';

import { useEffect, useMemo, useRef } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useRouter } from "next/navigation";

const defaultIcon = L.icon({
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function MapView({
  markers,
  activeMarkerId,
  setActiveMarkerId,
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

  return (
    <div className="h-[calc(100vh-6rem)] w-full overflow-hidden rounded border">
      <MapContainer
        center={[59.9139, 10.7522]}
        zoom={8}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {visibleMarkers.map(marker => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={defaultIcon}
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
                setActiveMarkerId(marker.id);
                event.target.openPopup();
              },
              mouseout: event => {
                setActiveMarkerId(null);
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