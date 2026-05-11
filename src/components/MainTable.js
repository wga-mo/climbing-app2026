'use client';

import { useRouter } from "next/navigation";

export default function MainTable({ crags, loading, activeCragId, setActiveCragId }) {
  const router = useRouter();

  if (loading) return <p>Loading crags...</p>;
  if (!crags.length) return <p>No crags found.</p>;

  return (
    <div className="overflow-auto">
      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-3 py-2 text-left">Crag</th>
            <th className="border px-3 py-2 text-right">Total</th>
            <th className="border px-3 py-2 text-right">&lt;5</th>
            <th className="border px-3 py-2 text-right">5</th>
            <th className="border px-3 py-2 text-right">6</th>
            <th className="border px-3 py-2 text-right">7</th>
            <th className="border px-3 py-2 text-right">8</th>
            <th className="border px-3 py-2 text-right">&gt;8</th>
          </tr>
        </thead>

        <tbody>
          {crags.map(crag => (
            <tr
              key={crag.crag_id}
              onClick={() => router.push(`/details/${crag.crag_id}`)}
              onMouseEnter={() => setActiveCragId(crag.crag_id)}
              onMouseLeave={() => setActiveCragId(null)}
              className={`
                cursor-pointer hover:bg-gray-100
                ${activeCragId === crag.crag_id ? "bg-blue-50" : ""}
              `}
            >
              <td className="border px-3 py-2 font-medium">
                {crag.crag_name}
              </td>
              <td className="border px-3 py-2 text-right">{crag.total_routes}</td>
              <td className="border px-3 py-2 text-right">{crag.range1}</td>
              <td className="border px-3 py-2 text-right">{crag.range2}</td>
              <td className="border px-3 py-2 text-right">{crag.range3}</td>
              <td className="border px-3 py-2 text-right">{crag.range4}</td>
              <td className="border px-3 py-2 text-right">{crag.range5}</td>
              <td className="border px-3 py-2 text-right">{crag.range6}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}