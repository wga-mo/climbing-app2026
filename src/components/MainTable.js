'use client';

import { useRouter } from "next/navigation";
import { useFilters } from "@/context/FiltersContext";

export default function MainTable({ crags, loading, activeCragId, setActiveCragId }) {
  const router = useRouter();

  const { filters, setFilters } = useFilters();

  const { sortColumn, sortDirection, searchText  } = filters;

  if (loading) return <p>Loading crags...</p>;

  function handleSort(column) {
    setFilters((prev) => {
      if (prev.sortColumn === column) {
        return {
          ...prev,
          sortDirection: prev.sortDirection === "asc" ? "desc" : "asc",
        };
      }

      return {
        ...prev,
        sortColumn: column,
        sortDirection: "desc",
      };
    });
  }

  function SortArrow({ column }) {
    const active = sortColumn === column;

    return (
      <span className={active ? "ml-1" : "ml-1 text-gray-300"}>
        {active
          ? sortDirection === "asc"
            ? "↑"
            : "↓"
          : "↕"}
      </span>
    );
  }

  const sortedCrags = [...crags].sort((a, b) => {
    const aValue = a[sortColumn] ?? 0;
    const bValue = b[sortColumn] ?? 0;

    if (typeof aValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortDirection === "asc"
      ? aValue - bValue
      : bValue - aValue;
  });


  return (
    <div className="w-full">

      <input
        type="search"
        value={searchText}
        onChange={(e) =>
          setFilters((prev) => ({
            ...prev,
            searchText: e.target.value,
          }))
        }
        placeholder="Search crags, sectors or routes."
        className="mb-3 w-full rounded border px-3 py-2 text-sm"
      />

      {!crags.length ? (
        <p>No crags found.</p>
      ) : (
        <table className="w-full table-fixed border-collapse text-sm text-center">
          <thead className="bg-gray-100 border-gray-500">
            <tr>
              <th className="w-[30%] px-2 py-2 text-left font-semibold">
                <button 
                  type="button"
                  onClick={() => handleSort("crag_name")}
                  className="block w-full text-left cursor-pointer hover:underline"
                >
                  Crag name <SortArrow column="crag_name" />
                </button>
              </th>
              <th className="px-1 py-2 font-semibold">
                <button 
                  type="button"
                  onClick={() => handleSort("total_routes")}
                  className="block w-full cursor-pointer hover:underline"
                >
                  ∑ <SortArrow column="total_routes" />
                </button>
              </th>
              <th className="px-3 py-2">&lt;5</th>
              <th className="px-3 py-2">5</th>
              <th className="px-3 py-2">6</th>
              <th className="px-3 py-2">7</th>
              <th className="px-3 py-2">8</th>
              <th className="px-3 py-2">&gt;8</th>
            </tr>
          </thead>

          <tbody>
            {sortedCrags.map(crag => (
              <tr
                key={crag.crag_id}
                onClick={() => router.push(`/crag/${crag.crag_id}`)}
                onMouseEnter={() => setActiveCragId(crag.crag_id)}
                onMouseLeave={() => setActiveCragId(null)}
                className={`
                  cursor-pointer hover:bg-gray-100
                  ${activeCragId === crag.crag_id ? "bg-blue-50" : ""}
                  odd:bg-white even:bg-gray-100
                  text-center
                `}
              >
                <td className="border border-gray-300 px-2 py-1.5 text-left whitespace-normal break-words">
                  {crag.crag_name}
                </td>
                <td className="border border-gray-300 px-1 py-1.5">{crag.total_routes}</td>
                <td className="border border-gray-300 px-1 py-1.5">{crag.range1}</td>
                <td className="border border-gray-300 px-1 py-1.5">{crag.range2}</td>
                <td className="border border-gray-300 px-1 py-1.5">{crag.range3}</td>
                <td className="border border-gray-300 px-1 py-1.5">{crag.range4}</td>
                <td className="border border-gray-300 px-1 py-1.5">{crag.range5}</td>
                <td className="border border-gray-300 px-1 py-1.5">{crag.range6}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}