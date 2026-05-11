export default function FiltersColumn({
  filters,
  setFilters,
}) {

  function handleCheckboxChange(event) {
    const { name, checked } = event.target;

    setFilters(prev => ({
      ...prev,
      [name]: checked,
    }));
  }

  return (
    <aside className="w-64 border-r bg-gray-50 p-4">
      <h2 className="text-lg font-semibold">
        Filters
      </h2>

      <div className="mt-4 space-y-2">

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="sport"
            checked={filters.sport}
            onChange={handleCheckboxChange}
          />
          Sport
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="trad"
            checked={filters.trad}
            onChange={handleCheckboxChange}
          />
          Trad
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="boulder"
            checked={filters.boulder}
            onChange={handleCheckboxChange}
          />
          Boulder
        </label>

      </div>
    </aside>
  );
}