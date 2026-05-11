export default function CragCard({ crag }) {
  return (
    <div className="rounded border p-3">

      <h2 className="text-lg font-semibold">
        {crag.name}
      </h2>

      <div className="mt-2 flex gap-2 text-sm">

        {crag.sport && (
          <span className="rounded bg-blue-100 px-2 py-1">
            Sport
          </span>
        )}

        {crag.trad && (
          <span className="rounded bg-green-100 px-2 py-1">
            Trad
          </span>
        )}

        {crag.boulder && (
          <span className="rounded bg-yellow-100 px-2 py-1">
            Boulder
          </span>
        )}

      </div>
    </div>
  );
}