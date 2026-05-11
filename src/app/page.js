'use client';

import { useFilters } from "@/context/FiltersContext";
import { useCrags } from "@/hooks/useCrags";
import FiltersSidebar from "@/components/FiltersSidebar";
import MainTable from "@/components/MainTable";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
});

export default function HomePage() {
  const { filters, setFilters } = useFilters();
  const { crags, loading } = useCrags(filters);

  return (
    <main className="flex flex-1 overflow-hidden">
      <FiltersSidebar
        filters={filters}
        setFilters={setFilters}
      />

      <section className="flex-1 overflow-auto p-4">
        <MainTable
          crags={crags}
          loading={loading}
        />
      </section>

      <section className="w-[45%] min-w-[500px] border-l p-4">
        <MapView crags={crags} />
      </section>
    </main>
  );
}