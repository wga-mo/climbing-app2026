'use client';

import { useState } from "react";
import FiltersColumn from "@/components/FiltersColumn";

export default function HomePage() {
  const [filters, setFilters] = useState({
    sport: true,
    trad: false,
    boulder: false,
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

        <div className="mt-6">
          <p>Sport: {filters.sport ? "yes" : "no"}</p>
          <p>Trad: {filters.trad ? "yes" : "no"}</p>
          <p>Boulder: {filters.boulder ? "yes" : "no"}</p>
        </div>
      </section>
    </main>
  );
}