'use client';

import { useFilters } from "@/context/FiltersContext";
import FiltersSidebar from "@/components/FiltersSidebar";

export default function DetailsClientLayout({ children }) {
  const { filters, setFilters } = useFilters();

  return (
    <main className="flex flex-1 min-h-0 overflow-hidden">
      <div className="hidden lg:flex">
        <FiltersSidebar
          filters={filters}
          setFilters={setFilters}
          mode="details"
        />
      </div>

      <section className="flex-1 overflow-auto px-4 pb-4 pt-0">
        {children}
      </section>
    </main>
  );
}