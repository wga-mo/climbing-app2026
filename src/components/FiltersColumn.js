export default function FiltersColumn() {
  return (
    <aside className="w-64 border-r bg-gray-50 p-4">
      <h2 className="text-lg font-semibold">
        Filters
      </h2>

      <div className="mt-4 space-y-2">
        <label className="flex items-center gap-2">
          <input type="checkbox" />
          Sport
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" />
          Trad
        </label>

        <label className="flex items-center gap-2">
          <input type="checkbox" />
          Boulder
        </label>
      </div>
    </aside>
  );
}