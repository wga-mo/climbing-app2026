import dynamic from "next/dynamic"; //trengs for map
import { useRef, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import GuidebooksList from "@/components/GuidebooksList";
import GradeHistogram from "@/components/GradeHistogram";


export default function CragOverview({
  crag,
  pageInfo,
  sectors,
  allSectors,
  guidebooks,
  locations,
  routes,
  filters,
  children,
}) {

  const [showNavigationMenu, setShowNavigationMenu] = useState(false);
  const [rightPanelView, setRightPanelView] = useState("map");
  const [overviewImages, setOverviewImages] = useState([]);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const navigationMenuRef = useRef(null);

  //useEffect brukes for å lukke Navigate menu når man klikker utenom menuen
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        navigationMenuRef.current &&
        !navigationMenuRef.current.contains(event.target)
      ) {
        setShowNavigationMenu(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  //useEffect to load overview images if it/they exist(s) and set overviewExists to true if at least one overview image is found
  useEffect(() => {
  async function loadOverviews() {
    if (!crag?.crag_id) return;

    const folder = `crags/${crag.crag_id}`;

    const { data: files, error } = await supabase.storage
      .from("topos")
      .list(folder);

    if (error) return;

    const overviewFiles = files.filter(file =>
      // Vurder å gjøre endringer her hvis man i fremtiden ønsker å hente overview bilder relatert til sektoren. 
      // Eks: pageInfo.type === 'sector' ? file.name.startsWith(`overview-sector-${sectorId}-`) : ...
      file.name.startsWith("overview-")
    );

    const signedUrls = await Promise.all(
      overviewFiles.map(async (file) => {
        const path = `${folder}/${file.name}`;

        const { data } = await supabase.storage
          .from("topos")
          .createSignedUrl(path, 3600);

        return {
          name: file.name,
          url: data?.signedUrl,
        };
      })
    );

    setOverviewImages(
      signedUrls.filter(img => img.url)
    );
  }

  loadOverviews();
}, [crag?.crag_id]);

  const MapView = dynamic(
    () => import("@/components/MapView"),
    { ssr: false }
  );

  function formatValue(value) {
    if (value === 1) return "yes";
    if (value === -1) return "no";
    return "?";
    }

  // Calculate walking time range from sectors  
  function walkingTime() { 
    
    const times = sectors.map(sector => Number(sector.walking_time)).filter((time) => Number.isFinite(time));
    
    if (times.length === 0) return "";

    const min = Math.min(...times);
    const max = Math.max(...times);

    // If max is 0, it means walking time is not defined for any sector, so we can fall back to the crag-level walking time
    if( max === 0 ) return `${crag.walking_time} min`;

    if (min === max) {
      return `${min} min`;
    }
    return `${min}-${max} min`;
  }
    
  const sectorById = new Map(
    (allSectors || []).map(sector => [
      sector.sector_id,
      sector,
    ])
  );

  const detailMarkers = (locations || [])
    .filter(location => location.lat && location.lng)
    .map(location => ({
      id: `location-${location.location_id}`,
      label:
      location.type === "crag"
        ? crag.crag_name
        : location.type?.startsWith("parking")
          ? "Parking"
          : location.type === "sector" ||
            location.type === "wall"
              ? sectorById.get(location.sector_id)?.name || "Sector"
              : location.type,
      lat: location.lat,
      lng: location.lng,
      type: location.type,
      href: location.sector_id && location.type === "sector" ? `/crag/${crag.crag_id}/sector/${location.sector_id}` : null,
    }));

  // Choose a marker for parking
  const parkingMarker =
  detailMarkers.find(marker => marker.type === "parking") ||
  detailMarkers.find(marker =>
    marker.type?.startsWith("parking")
  );

  const googleMapsUrl = parkingMarker
    ? `https://www.google.com/maps/search/?api=1&query=${parkingMarker.lat},${parkingMarker.lng}`
    : null;

  const appleMapsUrl = parkingMarker
    ? `https://maps.apple.com/?ll=${parkingMarker.lat},${parkingMarker.lng}&q=${encodeURIComponent(parkingMarker.label)}`
    : null;

  const items = [
    { icon: "🚗", value: `${crag.driving_time} min`, tooltip: `Driving time from ${crag.region}` },
    //{ icon: "🚶", value: `${crag.walking_time} min`, tooltip: `Walking time` },
    { icon: "🚶", value: walkingTime(), tooltip: `Walking time` },
    { icon: "☂️", value: formatValue(crag.rainproof), tooltip: `Rainproof` },
    { icon: "⛺", value: formatValue(crag.campsite), tooltip: `Campsite` },
    { icon: "🏝️", value: formatValue(crag.bathing), tooltip: `Bathing` },
    { icon: "🚌", value: formatValue(crag.buss_friendly), tooltip: `Public transport friendly` },
  ];

  return (
    <section className="grid items-strech gap-4 lg:grid-cols-2">
      
      {/* Left side: crag info */}
      <div className="rounded border p-4">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-3xl font-bold">
            {pageInfo.type === 'sector' ? 'Sector' : 'Crag'} {pageInfo.name}
          </h1>

          {/* Navigation button and menu */}
          {parkingMarker && (
          <div className="relative shrink-0" ref={navigationMenuRef}>
            <button
              onClick={() =>
                setShowNavigationMenu(prev => !prev)
              }
              className="rounded border px-2 py-1 text-xs hover:bg-gray-100 sm:text-sm"
            >
              📍 Navigate
            </button>

            {showNavigationMenu && (
              <div className="absolute right-0 top-10 z-50 min-w-[160px] rounded-md border bg-white shadow-lg">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={() =>
                    setShowNavigationMenu(false)
                  }
                >
                  Google Maps
                </a>

                <a
                  href={appleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-2 text-sm hover:bg-gray-100"
                  onClick={() =>
                    setShowNavigationMenu(false)
                  }
                >
                  Apple Maps
                </a>
              </div>
            )}
          </div>
        )}
        </div>
        
        {/* Small table with crag information */}
        {pageInfo.type === 'crag' && (
          <div className="mt-4 border-y">
            <div className="grid grid-cols-6 text-center">
              {items.map(item => (
              <div key={item.icon} className="py-2" title={item.tooltip}>
                <div className="text-2xl">{item.icon}</div>
                <div className="mt-2 text-sm">{item.value}</div>
              </div>
              ))}
            </div>
          </div>
        )}

        {pageInfo.description && (
          <div className="mt-6">
              <h2 className="text-xl font-semibold">
              Description
              </h2>

              <p className="mt-2 whitespace-pre-line">
              {pageInfo.description}
              </p>
          </div>
        )}

        {pageInfo.approach && (
            <div className="mt-6">
                <h2 className="text-xl font-semibold">
                Approach
                </h2>

                <p className="mt-2 whitespace-pre-line">
                {pageInfo.approach}
                </p>
            </div>
        )}

        {pageInfo.type === 'crag' && (
          <GuidebooksList guidebooks={guidebooks} />
        )}
        
        <div className="">
          <GradeHistogram
            routes={routes}
            filters={filters}
          />
        </div>

        {children}
      </div>

      {/* Right side: map */}
      <div className="flex flex-col rounded border p-4">
        <div className="mb-3 flex items-center gap-4">
          
          {/* A Map button */}
          <button
            onClick={() => setRightPanelView("map")}
            className={`text-xl font-semibold ${
              rightPanelView === "map"
                ? "text-black underline"
                : "text-gray-500"
            }`}
          >
            Map
          </button>
          
          {/* One Overview button for each overview image */}
          {overviewImages.map((img, index) => (
            <button
              key={img.name}
              onClick={() => setRightPanelView(img.name)}
              className={`text-xl font-semibold ${
                rightPanelView === img.name
                  ? "text-black underline"
                  : "text-gray-500"
              }`}
            >
              Overview {index + 1}
            </button>
          ))}
        </div>
        
        <div className="min-h-[300px] flex-1 overflow-hidden rounded">
          
          {rightPanelView === "map" ? (
            <MapView
              markers={detailMarkers}
              detailView
            />
          ) : (
            <img
              src={overviewImages.find(img => img.name === rightPanelView)?.url}
              alt="Overview"
              onClick={() =>
                setFullscreenImage(
                  overviewImages.find(img => img.name === rightPanelView)?.url
                )
              }
              className="h-full w-full cursor-zoom-in object-contain"
            />
          )}

          {/* Fullscreen image overlay */}
          {fullscreenImage && (
            <div className="fixed inset-0 z-[9999] bg-black/90">
              <button
                onClick={() => setFullscreenImage(null)}
                className="fixed right-4 top-4 z-[10000] rounded bg-white px-3 py-1 text-black"
              >
                Close
              </button>

              <div className="h-screen w-screen overflow-auto">
                <img
                  src={fullscreenImage}
                  alt="Fullscreen overview"
                  className="min-h-full min-w-full object-contain"
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </section>
  );
}