export default function FiltersSidebar({ filters, setFilters }) {
  function handleRegionChange(event) {
    setFilters(prev => ({
      ...prev,
      region: event.target.value,
    }));
  }

  function handleDrivingTimeChange(event) {
    setFilters(prev => ({
      ...prev,
      maxDrivingTime: Number(event.target.value),
    }));
  }

  return (
    <aside className="w-64 border-r bg-gray-50 p-4">
      <h2 className="text-lg font-semibold">Filters</h2>

      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="text-sm font-medium">Region</span>

          <select
            value={filters.region}
            onChange={handleRegionChange}
            className="mt-1 w-full rounded border p-2"
          >
            <option value="all">All regions</option>
            <option value="Oslo">Oslo</option>
            <option value="Bergen">Bergen</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-medium">
            Max driving time: {filters.maxDrivingTime} min
          </span>

          <input
            type="range"
            min="0"
            max="300"
            step="15"
            value={filters.maxDrivingTime}
            onChange={handleDrivingTimeChange}
            className="mt-2 w-full"
          />
        </label>
      </div>
    </aside>
  );
}