'use client';

import { useFilters } from "@/context/FiltersContext";
import SectorRouteTables from "@/components/SectorRouteTables";
import Link from "next/link";
import CragOverview from "@/components/CragOverview";
import GradeHistogram from "@/components/GradeHistogram";

export default function CragDetailsContent({ 
  crag, 
  currentSector,
  sectors, 
  allSectors,
  routes, 
  guidebooks,
  locations,
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
        driving_directions: crag.driving_directions,
        approach: crag.approach,
        walking_time: crag.walking_time,
        orientation: crag.orientation,
        steepness: crag.steepness,
        type: 'crag'
      };

      console.log('pageinfo: ', pageInfo);
  function getRoutesForSectorIds(routes, sectorIds) {
    const sectorIdSet = new Set(sectorIds);

    return routes.filter((route) =>
      sectorIdSet.has(route.sector_id)
    );
  }

  //Some histogram logic
  let histogramSectorIds = [];

  if (showSectorCards) {
    // card page: use child walls
    histogramSectorIds = allSectors
      .filter((s) =>
        sectors.some(
          (parent) =>
            s.parent_sector_id === parent.sector_id
        )
      )
      .map((s) => s.sector_id);
  } else {
    // normal page: use displayed sectors
    histogramSectorIds = sectors.map(
      (s) => s.sector_id
    );
  }

  const visibleRoutes = getRoutesForSectorIds(
    routes,
    histogramSectorIds
  );

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
        allSectors={allSectors}
        guidebooks={guidebooks}
        locations={locations}
        routes={visibleRoutes}
        filters={filters}
      >

      </CragOverview>

      {showSectorCards ? (
        
        <section className="p-4">
          <h2 className="mb-3 text-xl font-semibold">Sectors</h2>

          <div className="grid gap-3">
            {sectors.map((sector) => {
              const childSectorIds = allSectors
                .filter((s) => s.parent_sector_id === sector.sector_id)
                .map((s) => s.sector_id);

              const sectorRoutes = getRoutesForSectorIds(
                routes,
                childSectorIds
              );

              return (
                <Link
                  key={sector.sector_id}
                  href={`/crag/${crag.crag_id}/sector/${sector.sector_id}`}
                  className="rounded border p-4 hover:bg-gray-50"
                >
                  <h3 className="font-semibold">
                    {sector.name}
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {sectorRoutes.length} routes
                  </p>

                  {sector.description && (
                    <p className="mt-2 text-sm text-gray-600">
                      {sector.description}
                    </p>
                  )}
                  {sectorRoutes.length > 0 && (
                  <div className="">
                            <GradeHistogram
                              routes={sectorRoutes}
                              filters={filters}
                            />
                          </div>
                  )}
                </Link>
              );
            })}
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