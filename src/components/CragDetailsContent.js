'use client';

import { useFilters } from "@/context/FiltersContext";
import GradeHistogram from "@/components/GradeHistogram";
import SectorRouteTables from "@/components/SectorRouteTables";
import { useRouter } from "next/navigation";

export default function CragDetailsContent({ crag, sectors, routes }) {
  const { filters } = useFilters();
  const router = useRouter();

  return (
    <>
        <button
            onClick={() => router.back()}
            className="mb-4 rounded border px-3 py-1 text-sm hover:bg-gray-100"
            >
            ← Back
        </button>
        
      <h1 className="text-3xl font-bold">
        {crag.crag_name}
      </h1>

      <p className="mt-2 text-gray-600">
        {crag.area}, {crag.region}, {crag.country}
      </p>

      <div className="mt-6 space-y-2">

        <p>
          <strong>Steepness:</strong> {crag.steepness}
        </p>

        <p>
          <strong>Driving time:</strong> {crag.driving_time} min
        </p>

        <p>
          <strong>Walking time:</strong> {crag.walking_time} min
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
      <GradeHistogram
        routes={routes}
        filters={filters}
      />

      <SectorRouteTables
        sectors={sectors}
        routes={routes}
      />
    </>
  );
}