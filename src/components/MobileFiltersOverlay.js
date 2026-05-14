'use client';

import { useFilters } from "@/context/FiltersContext";
import FiltersSidebar from "@/components/FiltersSidebar";

export default function MobileFiltersOverlay() {
  const {
    filters,
    setFilters,
    mobileFiltersVisible,
  } = useFilters();

  if (!mobileFiltersVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-white lg:hidden">
      <FiltersSidebar
        filters={filters}
        setFilters={setFilters}
        mobile
      />
    </div>
  );
}