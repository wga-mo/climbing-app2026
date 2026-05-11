export default function FiltersSidebar({ filters, setFilters }) {
  function handleCheckboxChange(event) {
    const { name, checked } = event.target;

    setFilters(prev => ({
      ...prev,
      [name]: checked,
    }));
  }

  function handleNumberChange(event) {
    const { name, value } = event.target;

    setFilters(prev => ({
      ...prev,
      [name]: Number(value),
    }));
  }

  return (
    <aside className="w-64 shrink-0 border-r bg-gray-50 p-4 overflow-auto">
      <h2 className="text-lg font-semibold">Filters</h2>

      <div className="mt-4 space-y-5">

        <label className="flex items-center gap-2 font-medium">
          <input
            type="checkbox"
            name="globalFilter"
            checked={filters.globalFilter}
            onChange={handleCheckboxChange}
          />
          Use filters
        </label>

        <section>
          <h3 className="text-sm font-semibold">Style</h3>

          <label className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              name="sport"
              checked={filters.sport}
              onChange={handleCheckboxChange}
            />
            Sport
          </label>

          <label className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              name="trad"
              checked={filters.trad}
              onChange={handleCheckboxChange}
            />
            Trad / mix
          </label>

          <label className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              name="boulder"
              checked={filters.boulder}
              onChange={handleCheckboxChange}
            />
            Boulder
          </label>
        </section>

        <section>
          <h3 className="text-sm font-semibold">Grade</h3>

          <label className="mt-2 block text-sm">
            Min grade
            <input
              type="number"
              name="gradeMin"
              value={filters.gradeMin}
              onChange={handleNumberChange}
              className="mt-1 w-full rounded border p-1"
            />
          </label>

          <label className="mt-2 block text-sm">
            Max grade
            <input
              type="number"
              name="gradeMax"
              value={filters.gradeMax}
              onChange={handleNumberChange}
              className="mt-1 w-full rounded border p-1"
            />
          </label>
        </section>

        <section>
          <h3 className="text-sm font-semibold">Pitch type</h3>

          <label className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              name="p_s"
              checked={filters.p_s}
              onChange={handleCheckboxChange}
            />
            Single-pitch
          </label>

          <label className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              name="p_m"
              checked={filters.p_m}
              onChange={handleCheckboxChange}
            />
            Multi-pitch
          </label>
        </section>

        <section>
          <h3 className="text-sm font-semibold">Travel time</h3>

          <label className="mt-2 block text-sm">
            Max driving time: {filters.d_time} min
            <input
              type="range"
              name="d_time"
              min="0"
              max="300"
              step="15"
              value={filters.d_time}
              onChange={handleNumberChange}
              className="mt-1 w-full"
            />
          </label>

          <label className="mt-3 block text-sm">
            Max walking time: {filters.w_time} min
            <input
              type="range"
              name="w_time"
              min="0"
              max="180"
              step="5"
              value={filters.w_time}
              onChange={handleNumberChange}
              className="mt-1 w-full"
            />
          </label>
        </section>

        <section>
          <h3 className="text-sm font-semibold">Region</h3>

          <label className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              name="oslo"
              checked={filters.oslo}
              onChange={handleCheckboxChange}
            />
            Oslo
          </label>

          <label className="mt-2 flex items-center gap-2">
            <input
              type="checkbox"
              name="bergen"
              checked={filters.bergen}
              onChange={handleCheckboxChange}
            />
            Bergen
          </label>
        </section>
      </div>
    </aside>
  );
}