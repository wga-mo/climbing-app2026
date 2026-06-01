'use client';

import { useFilters } from "@/context/FiltersContext";
import { useCrags } from "@/hooks/useCrags";
import { useState } from "react";
import FiltersSidebar from "@/components/FiltersSidebar";
import MainTable from "@/components/MainTable";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
});

export default function HomePage() {
  const { filters, setFilters, activeMobileView, setActiveMobileView, mobileFiltersVisible, } = useFilters();
  const { crags, loading } = useCrags(filters);
  const [activeCragId, setActiveCragId] = useState(null);
  const markers = crags
  .filter(crag => crag.loc_lat && crag.loc_long)
  .map(crag => ({
    id: crag.crag_id,
    label: crag.crag_name,
    lat: crag.loc_lat,
    lng: crag.loc_long,
    type: "crag",
    href: `/details/${crag.crag_id}`,
  }));

  return (
  <>
    {/* Desktop layout */}
    <main className="hidden lg:flex flex-1 overflow-hidden">
      <FiltersSidebar
        filters={filters}
        setFilters={setFilters}
      />

      <section className="flex-1 overflow-auto p-4">
        <MainTable
          crags={crags}
          loading={loading}
          activeCragId={activeCragId}
          setActiveCragId={setActiveCragId}
        />
      </section>

      <section className="w-[45%] min-w-[500px] border-l p-4">
        <MapView
          markers={markers}
          activeMarkerId={activeCragId}
          setActiveMarkerId={setActiveCragId}
        />
      </section>
    </main>

    {/* Mobile layout */}
    <main className="flex flex-1 min-h-0 overflow-hidden lg:hidden">
      {activeMobileView === "table" ? (
        <section className="flex-1 min-h-0 min-w-0 overflow-auto p-4">
          <MainTable
            crags={crags}
            loading={loading}
            activeCragId={activeCragId}
            setActiveCragId={setActiveCragId}
          />
        </section>
      ) : (
        <section className="flex-1 min-h-0 min-w-0 overflow-auto p-4">
          <MapView
            markers={markers}
            activeMarkerId={activeCragId}
            setActiveMarkerId={setActiveCragId}
          />
        </section>
      )}
    </main>

    {/* Mobile table/map toggle */}
    {!mobileFiltersVisible && (
      <button
        onClick={() =>
          setActiveMobileView(prev =>
            prev === "table" ? "map" : "table"
          )
        }
        className="fixed bottom-4 left-1/2 z-[9999] -translate-x-1/2 rounded-full bg-white px-4 py-2 shadow lg:hidden"
      >
        {activeMobileView === "table" ? "Show map" : "Show table"}
      </button>
    )}
  </>
);
}