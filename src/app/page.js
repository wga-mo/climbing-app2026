'use client';

import { useState } from "react";
import FiltersColumn from "@/components/FiltersColumn";
import { crags } from "@/data/crags";
import CragCard from "@/components/CragCard";

export default function HomePage() {
  const [filters, setFilters] = useState({
    sport: true,
    trad: false,
    boulder: false,
  });

  const filteredCrags = crags.filter(crag => {
  if (filters.sport && crag.sport) return true;
  if (filters.trad && crag.trad) return true;
  if (filters.boulder && crag.boulder) return true;

  return false;
  });

  return (
    <main className="flex flex-1">
      <FiltersColumn
        filters={filters}
        setFilters={setFilters}
      />

      <section className="flex-1 p-4">
  <h1 className="text-3xl font-bold">
    Climbing Database
  </h1>

  <div className="mt-6 space-y-2">

    {filteredCrags.map(crag => (
      <CragCard
    key={crag.id}
    crag={crag}
  />
    ))}

  </div>
</section>
    </main>
  );
}