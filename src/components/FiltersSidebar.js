import { gradeConversion } from "@/utils/gradeConversion";
import { useFilters } from "@/context/FiltersContext";
import { useAuth } from "@/context/AuthContext";

export default function FiltersSidebar({ filters, setFilters, mobile = false, mode="main" }) {

  const regionOptions = [
    { label: "Oslo", value: "Oslo" },
    { label: "Vestland", value: "Vestland" },
  ];

  function handleRegionChange(regionValue) {
    setFilters(prev => {
      const selectedRegions = prev.selectedRegions || [];

      return {
        ...prev,
        selectedRegions: selectedRegions.includes(regionValue)
          ? selectedRegions.filter(region => region !== regionValue)
          : [...selectedRegions, regionValue],
      };
    });
  }

  const filtersDisabled = !filters.globalFilter;
  const { setMobileFiltersVisible } = useFilters();
  const isDetailsMode = mode === "details";
  const travelFiltersDisabled = isDetailsMode;

  const { user, loading: authLoading } = useAuth();

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

  function handleGradeMinChange(event) {
    const value = Number(event.target.value);

    setFilters(prev => ({
      ...prev,
      gradeMin: Math.min(value, prev.gradeMax),
    }));
  }

  function handleGradeMaxChange(event) {
    const value = Number(event.target.value);

    setFilters(prev => ({
      ...prev,
      gradeMax: Math.max(value, prev.gradeMin),
    }));
  }

  return (
    <aside 
      className={
        mobile
          ? "fixed inset-0 z-[9999] overflow-auto bg-white p-4"
          : "h-full w-64 shrink-0 overflow-auto border-r bg-gray-50 p-3"
      }>
      
      {/* Global filter toggle and close button for mobile view */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Filters</h2>

        {mobile && (
          <button
            onClick={() => setMobileFiltersVisible(false)}
            className="mb-4 rounded border px-3 py-1 text-sm"
          >
            Close filters
          </button>
        )}

        <label className="relative inline-flex cursor-pointer items-center">
          <input
            type="checkbox"
            name="globalFilter"
            checked={filters.globalFilter}
            onChange={handleCheckboxChange}
            className="peer sr-only"
          />
          <div className="h-5 w-10 rounded-full bg-gray-300 peer-checked:bg-blue-600" />
          <div className="absolute left-1 top-1 h-3 w-3 rounded-full bg-white transition peer-checked:translate-x-5" />
        </label>
      </div>

      {/* All other filters */}
      <div className={`${filtersDisabled ? "pointer-events-none opacity-40" : ""} `}>
        {/* Style filter (sport, trad, boulder) */}
        <section className="mt-4 border-b pb-3">
          <h3 className="text-xl font-semibold">Style</h3>

          <label className="mt-2 flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              name="sport"
              checked={filters.sport}
              onChange={handleCheckboxChange}
            />
            Sport
          </label>

          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              name="trad"
              checked={filters.trad}
              onChange={handleCheckboxChange}
            />
            Trad & mix
          </label>

          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              name="boulder"
              checked={filters.boulder}
              onChange={handleCheckboxChange}
            />
            Boulder
          </label>
        </section>

        {/* Grade filter */}
        <section className="mt-3 border-b pb-4">
          <h3 className="text-xl font-semibold">Grade</h3>

          <div className="mt-2 flex items-center gap-1">
            <input
              type="text"
              value={gradeConversion(filters.gradeMin)}
              readOnly
              className="w-full rounded border border-gray-400 bg-white px-2 py-1 text-center"
            />

            <span>-</span>

            <input
              type="text"
              value={gradeConversion(filters.gradeMax)}
              readOnly
              className="w-full rounded border border-gray-400 bg-white px-2 py-1 text-center"
            />
          </div>

          <div className="relative mt-4 h-6">
    {/* Gray background line */}
    <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded bg-gray-200" />

    {/* Black selected range */}
    <div
      className="absolute top-1/2 h-1 -translate-y-1/2 rounded bg-black"
      style={{
        left: `${(filters.gradeMin / 37) * 100}%`,
        width: `${((filters.gradeMax - filters.gradeMin) / 37) * 100}%`,
      }}
    />

    <input
      type="range"
      min="1"
      max="37"
      value={filters.gradeMin}
      onChange={handleGradeMinChange}
      className="range-thumb pointer-events-none absolute top-1/2 w-full -translate-y-1/2 appearance-none bg-transparent"
    />

    <input
      type="range"
      min="1"
      max="37"
      value={filters.gradeMax}
      onChange={handleGradeMaxChange}
      className="range-thumb pointer-events-none absolute top-1/2 w-full -translate-y-1/2 appearance-none bg-transparent"
    />
  </div>
        </section>

        {/* Pitches filter */}
        <section className="mt-3 border-b pb-3 ">
          <h3 className="text-xl font-semibold">Pitches</h3>

          <label className="mt-2 flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              name="p_s"
              checked={filters.p_s}
              onChange={handleCheckboxChange}
            />
            Single
          </label>

          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              name="p_m"
              checked={filters.p_m}
              onChange={handleCheckboxChange}
            />
            Multi
          </label>
        </section>

        {/* Driving time filter */}
        <section className={`mt-3 border-b pb-4 ${travelFiltersDisabled ? "pointer-events-none opacity-40" : ""}`}>
          <h3 className="text-xl font-semibold">Driving time</h3>

          <p className="mt-2 text-sm">{filters.d_time} minutes</p>

          <div className="relative mt-3 h-6">

            {/* Gray background */}
            <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded bg-gray-300" />

            {/* Black filled part */}
            <div
              className="absolute top-1/2 h-1 -translate-y-1/2 rounded bg-black"
              style={{
                width: `${(filters.d_time / 300) * 100}%`,
              }}
            />

            <input
              type="range"
              name="d_time"
              min="0"
              max="300"
              step="15"
              value={filters.d_time}
              onChange={handleNumberChange}
              className="black-slider absolute top-1/2 w-full -translate-y-1/2"
            />
          </div>
        </section>

        {/* Walking time filter */}
        <section className={`mt-3 border-b pb-4 ${travelFiltersDisabled ? "pointer-events-none opacity-40" : ""}`}>
          <h3 className="text-xl font-semibold">Walking time</h3>

          <p className="mt-2 text-sm">{filters.w_time} minutes</p>

          <div className="relative mt-3 h-6">

            <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded bg-gray-300" />

            <div
              className="absolute top-1/2 h-1 -translate-y-1/2 rounded bg-black"
              style={{
                width: `${(filters.w_time / 180) * 100}%`,
              }}
            />

            <input
              type="range"
              name="w_time"
              min="0"
              max="180"
              step="5"
              value={filters.w_time}
              onChange={handleNumberChange}
              className="black-slider absolute top-1/2 w-full -translate-y-1/2"
            />
          </div>
        </section>
      </div>
        
      {user && (
        <>
      {/* Region filter */}
      <section className={`mt-3 border-b pb-4 ${travelFiltersDisabled ? "pointer-events-none opacity-40" : ""}`}>
        <h3 className="text-xl font-semibold">Region</h3>

        {regionOptions.map(region => (
          <label key={region.value} className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={filters.selectedRegions?.includes(region.value) ?? false}
              onChange={() => handleRegionChange(region.value)}
            />
            {region.label}
          </label>
        ))}
      </section>
      </>
      )}
    </aside>
  );
}