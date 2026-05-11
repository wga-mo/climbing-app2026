import FiltersColumn from "@/components/FiltersColumn";

export default function HomePage() {
  return (
    <main className="flex flex-1">
      <FiltersColumn />

      <section className="flex-1 p-4">
        <h1 className="text-3xl font-bold">
          Climbing Database
        </h1>

        <p className="mt-4">
          Main content area
        </p>
      </section>
    </main>
  );
}