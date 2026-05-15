export default function SectorDetailsSection({
  sector,
  children,
}) {
  return (
    <section className="mt-6 grid gap-4 lg:grid-cols-2">
      
      {/* Left side */}
      <div className="rounded border p-4">
        <h2 className="text-xl font-semibold">
          {sector.name}
        </h2>

        {sector.description && (
          <p className="mt-2 text-gray-600">
            {sector.description}
          </p>
        )}

        <div className="mt-3 space-y-1 text-sm text-gray-600">
          {sector.walking_time !== null && (
            <p>
              Walking time: {sector.walking_time} min
            </p>
          )}

          {sector.steepness?.length > 0 && (
            <p>
              Steepness:{" "}
              {sector.steepness.join(", ")}
            </p>
          )}
        </div>

        <div className="mt-4">
          {children}
        </div>
      </div>

      {/* Right side */}
      <div className="rounded border p-4">
        <h3 className="mb-3 text-lg font-semibold">
          Topo
        </h3>

        <div className="flex h-[300px] items-center justify-center rounded bg-gray-100 text-gray-500">
          Topo placeholder
        </div>
      </div>
    </section>
  );
}