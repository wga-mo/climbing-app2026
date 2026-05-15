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


  return (
    <section className="grid items-strech gap-4 lg:grid-cols-2">
      
      {/* Left side: crag info */}
      <div className="rounded border p-4">
        <h1 className="text-3xl font-bold">
          {crag.crag_name}
        </h1>

        <p className="mt-2 text-gray-600">
          {crag.area}, {crag.region}
        </p>


        <div className="mt-6 space-y-2 text-sm">
          <p>
            <strong>Sectors:</strong> {sectors.length}
          </p>

          <p>
            <strong>Routes:</strong> {routes.length}
          </p>

          <p>
            <strong>Driving time:</strong>{" "}
            {crag.driving_time} min
          </p>

          <p>
            <strong>Walking time:</strong>{" "}
            {crag.walking_time} min
          </p>
        </div>

        <div className="mt-6">
            <h2 className="text-xl font-semibold">
            Description
            </h2>

            <p className="mt-2 whitespace-pre-line">
            {crag.description}
            </p>
        </div>

        <div className="mt-6">
            <h2 className="text-xl font-semibold">
            Approach
            </h2>

            <p className="mt-2 whitespace-pre-line">
            {crag.approach}
            </p>
        </div>

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