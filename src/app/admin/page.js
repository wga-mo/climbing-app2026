export default function AdminPage() {
  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Administration
      </h1>

      <div className="grid gap-4 md:grid-cols-2">
        <a
          href="/admin/analytics"
          className="rounded-lg border p-6 hover:bg-gray-50"
        >
          <h2 className="text-xl font-semibold">
            📊 Analytics
          </h2>
          <p className="mt-2 text-gray-600">
            View visitor statistics and usage.
          </p>
        </a>
      </div>
    </div>
  );
}