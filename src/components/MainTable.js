export default function MainTable({ crags, loading }) {
  if (loading) {
    return (
      <>
        <h1 className="text-3xl font-bold">Climbing Database</h1>
        <p className="mt-6">Loading crags...</p>
      </>
    );
  }

  if (!crags.length) {
    return (
      <>
        <h1 className="text-3xl font-bold">Climbing Database</h1>
        <p className="mt-6">No crags found.</p>
      </>
    );
  }

  return (
    <>
      <h1 className="text-3xl font-bold">Climbing Database</h1>

      <p className="mt-2 text-gray-600">
        Showing {crags.length} crags from Supabase.
      </p>

      <div className="mt-6 overflow-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-3 py-2 text-left">Crag</th>
              <th className="border px-3 py-2 text-left">Area</th>
              <th className="border px-3 py-2 text-left">Region</th>
              <th className="border px-3 py-2 text-right">Drive</th>
              <th className="border px-3 py-2 text-right">Walk</th>
            </tr>
          </thead>

          <tbody>
            {crags.map(crag => (
              <tr key={crag.crag_id} className="hover:bg-gray-50">
                <td className="border px-3 py-2 font-medium">
                  {crag.crag_name}
                </td>
                <td className="border px-3 py-2">{crag.area}</td>
                <td className="border px-3 py-2">{crag.region}</td>
                <td className="border px-3 py-2 text-right">
                  {crag.driving_time} min
                </td>
                <td className="border px-3 py-2 text-right">
                  {crag.walking_time} min
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}