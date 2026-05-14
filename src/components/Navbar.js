'use client';

import { useFilters } from "@/context/FiltersContext";

export default function Navbar() {
  const {
    filters,
    setFilters,
    setMobileFiltersVisible,
  } = useFilters();

  function toggleGlobalFilter() {
    setFilters(prev => ({
      ...prev,
      globalFilter: !prev.globalFilter,
    }));
  }

  return (
    <header className="border-b bg-white">
      <nav className="flex h-14 items-center justify-between px-4">
        <div className="text-lg font-bold">
          Climbing Database
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setMobileFiltersVisible(true)}
            className="rounded border px-3 py-1 text-sm"
          >
            Filters
          </button>

          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={filters.globalFilter}
              onChange={toggleGlobalFilter}
              className="peer sr-only"
            />
            <div className="h-5 w-10 rounded-full bg-gray-300 peer-checked:bg-black" />
            <div className="absolute left-1 top-1 h-3 w-3 rounded-full bg-white transition peer-checked:translate-x-5" />
          </label>
        </div>

        <button className="hidden rounded-md border px-3 py-1 text-sm lg:block">
          Menu
        </button>
      </nav>
    </header>
  );
}