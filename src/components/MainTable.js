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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}