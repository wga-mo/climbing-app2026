export default async function CragDetailsPage({ params }) {
    const { crag_id } = await params;

  return (
    <main className="p-4">

      <h1 className="text-3xl font-bold">
        Crag Details
      </h1>

      <p className="mt-4">
        Crag ID: {crag_id}
      </p>

    </main>
  );
}