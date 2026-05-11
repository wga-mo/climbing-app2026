'use client';

import { useState } from "react";
import { useCrags } from "@/hooks/useCrags";

export default function HomePage() {
  const [filters, setFilters] = useState({
    region: "all",
    maxDrivingTime: 120,
  });

  const { crags, loading } = useCrags(filters);

  function handleRegionChange(event) {
    setFilters(prev => ({
      ...prev,
      region: event.target.value,
    }));
  }

  function handleDrivingTimeChange(event) {
    setFilters(prev => ({
      ...prev,
      maxDrivingTime: Number(event.target.value),
    }));
  }

  return (
    <main className="flex flex-1">
      <aside className="w-64 border-r bg-gray-50 p-4">
        <h2 className="text-lg font-semibold">Filters</h2>

        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="text-sm font-medium">Region</span>
            <select
              value={filters.region}
              onChange={handleRegionChange}
              className="mt-1 w-full rounded border p-2"
            >
              <option value="all">All regions</option>
              <option value="Oslo">Oslo</option>
              <option value="Bergen">Bergen</option>
            </select>
          </label>

          <label className="block">
            <span className="text-sm font-medium">
              Max driving time: {filters.maxDrivingTime} min
            </span>
            <input
              type="range"
              min="0"
              max="300"
              step="15"
              value={filters.maxDrivingTime}
              onChange={handleDrivingTimeChange}
              className="mt-2 w-full"
            />
          </label>
        </div>
      </aside>

      <section className="flex-1 p-4">
        <h1 className="text-3xl font-bold">Climbing Database</h1>

        {loading ? (
          <p className="mt-6">Loading crags...</p>
        ) : (
          <>
            <p className="mt-2 text-gray-600">
              Showing {crags.length} crags from Supabase.
            </p>

            <div className="mt-6 space-y-3">
              {crags.map(crag => (
                <div key={crag.crag_id} className="rounded border p-3">
                  <h2 className="font-semibold">{crag.crag_name}</h2>
                  <p className="text-sm text-gray-600">
                    {crag.area}, {crag.region}, {crag.country}
                  </p>
                  <p className="text-sm">
                    Drive: {crag.driving_time} min · Walk: {crag.walking_time} min
                  </p>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}