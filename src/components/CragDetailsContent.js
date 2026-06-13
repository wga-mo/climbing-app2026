'use client';

import { useFilters } from "@/context/FiltersContext";
import SectorRouteTables from "@/components/SectorRouteTables";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CragOverview from "@/components/CragOverview";

export default function CragDetailsContent({ 
  crag, 
  currentSector,
  sectors, 
  routes, 
  guidebooks,
  sectorId,
  showSectorCards
}) {
  const { filters } = useFilters();

  const isSectorPage = !!sectorId;
  
  const pageInfo = isSectorPage
    ? {
        name: currentSector?.name,
        description: currentSector?.description,
        approach: currentSector?.approach,
        walking_time: currentSector?.walking_time,
        orientation: currentSector?.orientation,
        steepness: currentSector?.steepness,
        type: 'sector'
      }
    : {
        name: crag.crag_name,
        description: crag.description,
        approach: crag.approach,
        walking_time: crag.walking_time,
        orientation: crag.orientation,
        steepness: crag.steepness,
        type: 'crag'
      };

  return (
    <>
      {/* Bread crumb */}
      <div className="sticky top-0 left-0 right-0 z-40 px-2 py-2 text-sm bg-white">
        <nav className="flex items-center gap-2 overflow-hidden">
          <Link href="/" className="shrink-0 underline">
            Crag overview
          </Link>

          <span className="shrink-0">/</span>

          {isSectorPage ? (
            <>
              <span className="truncate font-medium">
                <Link href={`/crag/${crag.crag_id}`} className="shrink-0 underline">
                  {crag.crag_name}
                </Link>
              </span>

              <span className="shrink-0">/</span>

              <span className="truncate font-medium">
              {pageInfo.name}
            </span>
            </>
          ) : (
            <span className="truncate font-medium">
              {crag.crag_name}
            </span>
          )}

        </nav>
      </div>

      <CragOverview
        crag={crag}
        pageInfo={pageInfo}
        sectors={sectors}
        guidebooks={guidebooks}
        routes={routes}
        filters={filters}
      >

      </CragOverview>

      {showSectorCards ? (
        <section className="p-4">
          <h2 className="mb-3 text-xl font-semibold">Sectors</h2>

          <div className="grid gap-3">
            {sectors.map((sector) => (
              <Link
                key={sector.sector_id}
                href={`/crag/${crag.crag_id}/sector/${sector.sector_id}`}
                className="rounded border p-4 hover:bg-gray-50"
              >
                <h3 className="font-semibold">{sector.name}</h3>

                {sector.description && (
                  <p className="mt-2 text-sm text-gray-600">
                    {sector.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      ) : (
        <SectorRouteTables
          sectors={sectors}
          routes={routes}
        />
      )}

    </>
  );
}