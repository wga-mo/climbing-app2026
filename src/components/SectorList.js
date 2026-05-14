export default function SectorList({ sectors }) {
  if (!sectors?.length) {
    return <p className="mt-3">No sectors added yet.</p>;
  }

  return (
    <section className="mt-8">
      <h2 className="text-xl font-semibold">Sectors</h2>

      <div className="mt-3 space-y-3">
        {sectors.map(sector => (
          <div key={sector.sector_id} className="rounded border p-3">
            <h3 className="font-semibold">{sector.name}</h3>

            {sector.walking_time !== null && (
              <p className="text-sm text-gray-600">
                Walking time: {sector.walking_time} min
              </p>
            )}

            {sector.description && (
              <p className="mt-2">{sector.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}