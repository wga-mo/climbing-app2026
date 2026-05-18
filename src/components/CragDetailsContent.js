'use client';

import { useFilters } from "@/context/FiltersContext";
import GradeHistogram from "@/components/GradeHistogram";
import SectorRouteTables from "@/components/SectorRouteTables";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CragOverview from "@/components/CragOverview";
import GuidebooksList from "@/components/GuidebooksList";

export default function CragDetailsContent({ crag, sectors, routes, guidebooks }) {
  const { filters } = useFilters();
  const router = useRouter();
  
  return (
    <>
      
    <div className="sticky top-0 z-20 px-2 py-2 text-sm">
  <nav className="flex items-center gap-2 overflow-hidden">
    <Link href="/" className="shrink-0 underline">
      Crag overview
    </Link>

    <span className="shrink-0">/</span>

    <span className="truncate font-medium">
      {crag.crag_name}
    </span>
  </nav>
</div>

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