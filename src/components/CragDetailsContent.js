'use client';

import { useFilters } from "@/context/FiltersContext";
import GradeHistogram from "@/components/GradeHistogram";
import SectorRouteTables from "@/components/SectorRouteTables";
import { useRouter } from "next/navigation";
import CragOverview from "@/components/CragOverview";
import GuidebooksList from "@/components/GuidebooksList";

export default function CragDetailsContent({ crag, sectors, routes, guidebooks }) {
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
        
      <CragOverview
        crag={crag}
        sectors={sectors}
        routes={routes}
      >
        <GuidebooksList guidebooks={guidebooks} />
        <GradeHistogram
          routes={routes}
          filters={filters}
        />
      </CragOverview>

      <SectorRouteTables
        sectors={sectors}
        routes={routes}
      />
    </>
  );
}