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
            <table className="mt-4 w-full table-fixed border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="w-8 py-2 text-left">#</th>

                  <th className="py-2 text-left">
                    Name
                  </th>

                  <th className="w-14 py-2 text-left">
                    Grade
                  </th>

                  <th className="hidden md:table-cell w-20 py-2 text-left">
                    Style
                  </th>

                  <th className="hidden md:table-cell w-16 py-2 text-left">
                    Length
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleRoutes.map(route => (
                  <tr key={route.route_id} className="border-b">
                    <td className="py-3 align-top">
                      {route.nr_in_picture}
                    </td>

                    <td className="py-3 pr-2">
                      <div className="break-words font-medium">
                        {route.name}
                      </div>

                      {/* Mobile-only secondary info */}
                      <div className="text-xs text-gray-500 md:hidden">
                        {route.style}
                        {route.length > 0 && ` • ${route.length}m`}
                      </div>
                    </td>

                    <td className="py-3 align-top">
                      {gradeConversion(route.grade_int)}
                    </td>

                    <td className="hidden md:table-cell py-3">
                      {route.style}
                    </td>

                    <td className="hidden md:table-cell py-3">
                      {route.length}
                    </td>
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