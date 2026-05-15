'use client';

import { useFilters } from "@/context/FiltersContext";
import { doesRouteMatchFilters } from "@/utils/doesRouteMatchFilters";
import SectorDetailsSection from "@/components/SectorDetailsSection";

export default function SectorRouteTables({ sectors, routes }) {
  const { filters } = useFilters();

  return (
    <section className="mt-8 space-y-6">
      {sectors.map(sector => {
        const sectorRoutes = routes.filter(
          route => route.sector_id === sector.sector_id
        );

        const visibleRoutes = sectorRoutes.filter(
          route => doesRouteMatchFilters(route, filters)
        );

        if (!visibleRoutes.length) {
          return null;
        }

        return (
          <SectorDetailsSection
            key={sector.sector_id}
            sector={sector}
          >
            <table className="mt-4 w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 text-left">Name</th>
                  <th className="py-2 text-left">Grade</th>
                  <th className="py-2 text-left">Style</th>
                </tr>
              </thead>

              <tbody>
                {visibleRoutes.map(route => (
                  <tr key={route.route_id} className="border-b">
                    <td className="py-2">{route.name}</td>
                    <td className="py-2">{route.grade_int}</td>
                    <td className="py-2">{route.style}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectorDetailsSection>
        );
      })}
    </section>
  );
}