'use client';

import { useCrags } from "@/hooks/useCrags";

export default function HomePage() {
  const { crags, loading } = useCrags();

  if (loading) {
    return <main className="p-4">Loading crags...</main>;
  }

  return (
    <main className="p-4">
      <h1 className="text-3xl font-bold">
        Climbing Database
      </h1>

      <p className="mt-2 text-gray-600">
        Showing {crags.length} crags from Supabase.
      </p>

      <div className="mt-6 space-y-3">

        {crags.map(crag => (
          <div
            key={crag.crag_id}
            className="rounded border p-3"
          >
            <h2 className="font-semibold">
              {crag.crag_name}
            </h2>

            <p className="text-sm text-gray-600">
              {crag.area}, {crag.region}, {crag.country}
            </p>

            <p className="text-sm">
              Drive: {crag.driving_time} min · Walk: {crag.walking_time} min
            </p>
          </div>
        ))}

      </div>
    </main>
  );
}