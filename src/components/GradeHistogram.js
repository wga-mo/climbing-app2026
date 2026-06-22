'use client';

import { doesRouteMatchFilters } from "@/utils/doesRouteMatchFilters";

const gradeBuckets = [
  { label: "<5", min: 1, max: 9 },
  { label: "5", min: 10, max: 13 },
  { label: "6", min: 14, max: 19 },
  { label: "7", min: 20, max: 24 },
  { label: "8", min: 25, max: 31 },
  { label: ">8", min: 32, max: 37 },
];

export default function GradeHistogram({ routes, filters }) {
  const totalRoutes = routes.length;
  const matchingRoutes = routes.filter(route =>
    doesRouteMatchFilters(route, filters)
  ).length;

  const histogramData = gradeBuckets.map(bucket => {
    const routesInBucket = routes.filter(route =>
      route.grade_int >= bucket.min &&
      route.grade_int <= bucket.max
    );

    const visible = routesInBucket.filter(route =>
      doesRouteMatchFilters(route, filters)
    ).length;

    const total = routesInBucket.length;
    const hidden = total - visible;

    return {
      ...bucket,
      total,
      visible,
      hidden,
    };
  });

  const maxTotal = Math.max(
    ...histogramData.map(bucket => bucket.total),
    1
  );

  return (
    <section className="mt-8 w-full max-w-[600px]">
      <h2 className="text-xl font-semibold">Grade distribution</h2>

      <p className="text-sm text-gray-600">
        {totalRoutes} routes, whereof {matchingRoutes} match current filters
      </p>

      <div className="mt-4">
        <div className="flex h-40 items-end gap-3 border-b px-4">
          {histogramData.map(bucket => {
            const visibleHeight = (bucket.visible / maxTotal) * 100;
            const hiddenHeight = (bucket.hidden / maxTotal) * 100;

            return (
              <div
                key={bucket.label}
                className="flex flex-1 items-end justify-center"
              >
                <div className="flex h-40 w-full max-w-10 flex-col justify-end">
                  <div
                    className="bg-gray-300"
                    style={{ height: `${hiddenHeight}%` }}
                  />
                  <div
                    className="bg-black"
                    style={{ height: `${visibleHeight}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-2 flex gap-3 px-4">
          {histogramData.map(bucket => (
            <div
              key={bucket.label}
              className="flex flex-1 flex-col items-center text-xs"
            >
              <div>{bucket.label}</div>
              <div className="text-gray-500">
                {bucket.visible}/{bucket.total}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-2 text-sm text-gray-600">
        Black = routes matching current filters. Gray = routes hidden by filters.
      </p>
    </section>
  );
}