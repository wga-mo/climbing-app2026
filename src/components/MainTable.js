'use client';

import { useRouter } from "next/navigation";

export default function MainTable({ crags, loading, activeCragId, setActiveCragId }) {
  const router = useRouter();
  console.log('test',crags);
  if (loading) return <p>Loading crags...</p>;
  
  
  if (!crags.length) return <p>No crags found.</p>;

  return (
    <div className="w-full">
      <table className="w-full table-fixed border-collapse text-sm text-center">
        <thead className="bg-gray-100 border-gray-500">
          <tr>
            <th className="w-[30%] px-2 py-2 text-left font-semibold">Crag name</th>
            <th className="px-1 py-2 font-semibold">∑</th>
            <th className="px-3 py-2">&lt;5</th>
            <th className="px-3 py-2">5</th>
            <th className="px-3 py-2">6</th>
            <th className="px-3 py-2">7</th>
            <th className="px-3 py-2">8</th>
            <th className="px-3 py-2">&gt;8</th>
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
    </div>
  );
}