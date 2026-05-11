'use client';

import { useFilters } from "@/context/FiltersContext";
import { useCrags } from "@/hooks/useCrags";
import FiltersSidebar from "@/components/FiltersSidebar";
import MainTable from "@/components/MainTable";

export default function HomePage() {
  const { filters, setFilters } = useFilters();
  const { crags, loading } = useCrags(filters);

  return (
    <main className="flex flex-1">
      <FiltersSidebar
        filters={filters}
        setFilters={setFilters}
      />

      <section className="flex-1 p-4">
        <MainTable
          crags={crags}
          loading={loading}
        />
      </section>
    </main>
  );
}