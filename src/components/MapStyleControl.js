"use client";

import { useEffect, useRef, useState } from "react";
import { TileLayer } from "react-leaflet";

const STORAGE_KEY = "climbing_map_style";

const MAP_STYLES = {
  topo: {
    name: "Kartverket",
    shortName: "Kartverket",
    icon: "⛰️",
    url: "https://cache.kartverket.no/v1/wmts/1.0.0/topo/default/webmercator/{z}/{y}/{x}.png",
    attribution:
      '&copy; <a href="https://www.kartverket.no/">Kartverket</a>',
    maxZoom: 18,
  },

  satellite: {
    name: "Satellite",
    shortName: "Sat",
    icon: "🛰️",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics",
    maxZoom: 19,
  },

  street: {
    name: "Street map",
    shortName: "Map",
    icon: "🗺️",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },
};

export default function MapStyleControl({
  positionClassName = "bottom-2 left-2",
}) {
  const [mapStyle, setMapStyle] = useState("topo");
  const [menuOpen, setMenuOpen] = useState(false);

  const controlRef = useRef(null);

  useEffect(() => {
    const storedStyle = localStorage.getItem(STORAGE_KEY);

    if (storedStyle && MAP_STYLES[storedStyle]) {
      setMapStyle(storedStyle);
    }
  }, []);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (
        controlRef.current &&
        !controlRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, []);

  function selectMapStyle(styleKey) {
    setMapStyle(styleKey);
    localStorage.setItem(STORAGE_KEY, styleKey);
    setMenuOpen(false);
  }

  const selectedStyle = MAP_STYLES[mapStyle];

  return (
    <>
      <TileLayer
        key={mapStyle}
        attribution={selectedStyle.attribution}
        url={selectedStyle.url}
        maxZoom={selectedStyle.maxZoom}
      />

      <div
        ref={controlRef}
        className={`absolute z-[1000] ${positionClassName}`}
        onClick={(event) => event.stopPropagation()}
        onDoubleClick={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
      >
        {menuOpen && (
          <div className="mb-2 overflow-hidden rounded-lg border border-gray-300 bg-white shadow-lg">
            {Object.entries(MAP_STYLES).map(([styleKey, style]) => {
              const selected = styleKey === mapStyle;

              return (
                <button
                  key={styleKey}
                  type="button"
                  onClick={() => selectMapStyle(styleKey)}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm ${
                    selected
                      ? "bg-blue-50 font-medium text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span aria-hidden="true">{style.icon}</span>

                  <span className="flex-1 whitespace-nowrap">
                    {style.name}
                  </span>

                  {selected && <span aria-hidden="true">✓</span>}
                </button>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen((current) => !current)}
          className="flex h-11 min-w-11 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-2 text-sm font-medium text-gray-700 shadow-md hover:bg-gray-50"
          aria-label="Choose map style"
          aria-expanded={menuOpen}
        >
          <span aria-hidden="true">{selectedStyle.icon}</span>
          <span>{selectedStyle.shortName}</span>
        </button>
      </div>
    </>
  );
}