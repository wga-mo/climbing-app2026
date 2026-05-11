'use client';

import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

export default function MapView({ crags }) {
  const cragsWithLocation = crags.filter(
    crag => crag.loc_lat && crag.loc_long
  );

  const defaultIcon = L.icon({
    iconUrl: "/leaflet/marker-icon.png",
    shadowUrl: "/leaflet/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

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

        {cragsWithLocation.map(crag => (
          <Marker
  key={crag.crag_id}
  position={[crag.loc_lat, crag.loc_long]}
  icon={defaultIcon}
>
            <Popup>
              <strong>{crag.crag_name}</strong>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}