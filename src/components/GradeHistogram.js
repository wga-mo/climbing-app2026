'use client';

import { doesRouteMatchFilters } from "@/utils/doesRouteMatchFilters";

const gradeBuckets = [
  { label: "<5", min: 1, max: 9 },
  { label: "5", min: 10, max: 12 },
  { label: "6", min: 13, max: 18 },
  { label: "7", min: 19, max: 23 },
  { label: "8", min: 24, max: 30 },
  { label: ">8", min: 31, max: 36 },
];

export default function GradeHistogram({ routes, filters }) {
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
    <section className="mt-8">
      <h2 className="text-xl font-semibold">Grade distribution</h2>

      <div className="mt-4 flex h-48 items-end gap-3 border-b border-l px-4 pb-2">
        {histogramData.map(bucket => {
          const visibleHeight = (bucket.visible / maxTotal) * 100;
          const hiddenHeight = (bucket.hidden / maxTotal) * 100;

          return (
            <div
              key={bucket.label}
              className="flex flex-1 flex-col items-center justify-end"
            >
              <div className="flex h-40 w-full max-w-10 flex-col justify-end">
                <div
                  className="bg-gray-300"
                  style={{ height: `${hiddenHeight}%` }}
                  title={`${bucket.hidden} hidden routes`}
                />

                <div
                  className="bg-black"
                  style={{ height: `${visibleHeight}%` }}
                  title={`${bucket.visible} visible routes`}
                />
              </div>

              <div className="mt-2 text-xs">
                {bucket.label}
              </div>

              <div className="text-xs text-gray-500">
                {bucket.visible}/{bucket.total}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-sm text-gray-600">
        Black = routes matching current filters. Gray = routes hidden by filters.
      </p>
    </section>
  );
}