'use client';

import { useFilters } from "@/context/FiltersContext";
import { doesRouteMatchFilters } from "@/utils/doesRouteMatchFilters";
import SectorDetailsSection from "@/components/SectorDetailsSection";
import { gradeConversion } from "@/utils/gradeConversion";

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
            <table className="mt-4 w-full table-fixed border-collapse">
              <thead>
                <tr className="border-b">        
                  <th className="w-10 py-2 text-left">#</th>
                  <th className="w-[45%] py-2 text-left">Name</th>
                  <th className="w-20 py-2 text-left">Grade</th>
                  <th className="w-24 py-2 text-left">Style</th>
                  <th className="w-20 py-2 text-left">Length</th>
                </tr>
              </thead>

              <tbody>
                {visibleRoutes.map(route => (
                  <tr key={route.route_id} className="border-b">
                    <td className="py-2">{route.nr_in_picture}</td>
                    <td className="py-2">{route.name}</td>
                    <td className="py-2">{gradeConversion(route.grade_int)}</td>
                    <td className="py-2">{route.style}</td>
                    <td className="py-2">{route.length}</td>
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