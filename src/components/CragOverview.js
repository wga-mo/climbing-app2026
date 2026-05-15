import dynamic from "next/dynamic"; //trengs for map

export default function CragOverview({
  crag,
  sectors,
  routes,
  children,
}) {
  const MapView = dynamic(
    () => import("@/components/MapView"),
    { ssr: false }
  );

  function formatValue(value) {
    if (value === 1) return "yes";
    if (value === -1) return "no";
    return "?";
    }

  const detailMarkers = [
    {
        id: `crag-${crag.crag_id}`,
        label: crag.crag_name,
        lat: crag.loc_lat,
        lng: crag.loc_long,
        type: "crag",
    },
    {
        id: `parking-${crag.crag_id}`,
        label: "Parking",
        lat: crag.par_lat,
        lng: crag.par_long,
        type: "parking",
    },
  ].filter(marker => marker.lat && marker.lng);

  const items = [
    { icon: "🚗", value: `${crag.driving_time} min`, tooltip: `Driving time from ${crag.region}` },
    { icon: "🚶", value: `${crag.walking_time} min`, tooltip: `Walking time` },
    { icon: "☂️", value: formatValue(crag.rainproof), tooltip: `Rainproof` },
    { icon: "⛺", value: formatValue(crag.campsite), tooltip: `Campsite` },
    { icon: "🏝️", value: formatValue(crag.bathing), tooltip: `Bathing` },
    { icon: "🚌", value: formatValue(crag.buss_friendly), tooltip: `Bus friendly` },
  ];

  return (
    <section className="grid items-strech gap-4 lg:grid-cols-2">
      
      {/* Left side: crag info */}
      <div className="rounded border p-4">
        <h1 className="text-3xl font-bold">
          {crag.crag_name}
        </h1>

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

        <div className="mt-6">
            <h2 className="text-xl font-semibold">
            Description
            </h2>

            <p className="mt-2 whitespace-pre-line">
            {crag.description}
            </p>
        </div>

        {crag.approach && (
            <div className="mt-6">
                <h2 className="text-xl font-semibold">
                Approach
                </h2>

                <p className="mt-2 whitespace-pre-line">
                {crag.approach}
                </p>
            </div>
 )}
        {children}
      </div>

      {/* Right side: map */}
      <div className="flex flex-col rounded border p-4">
        <h2 className="mb-3 text-xl font-semibold">
          Map
        </h2>

        <div className="min-h-[300px] flex-1 overflow-hidden rounded">
          <MapView
            markers={detailMarkers}
            detailView
          />
        </div>
      </div>
    </section>
  );
}