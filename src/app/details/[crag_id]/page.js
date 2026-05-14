import { supabase } from "@/lib/supabase";
import FiltersSidebar from "@/components/FiltersSidebar";
import DetailsClientLayout from "@/components/DetailsClientLayout";

export default async function CragDetailsPage({ params }) {
    const { crag_id } = await params;

  const { data: crag, error } = await supabase
    .from("crags")
    .select(`
      crag_id,
      crag_name,
      country,
      region,
      area,
      description,
      driving_time,
      walking_time,
      steepness
    `)
    .eq("crag_id", crag_id)
    .single();

  if (error || !crag) {
    return (
      <DetailsClientLayout>
        <h1 className="text-2xl font-bold">
          Crag not found
        </h1>
      </DetailsClientLayout>
    );
  }

  return (
    <DetailsClientLayout>
      <h1 className="text-3xl font-bold">
        {crag.crag_name}
      </h1>

      <p className="mt-2 text-gray-600">
        {crag.area}, {crag.region}, {crag.country}
      </p>

      <div className="mt-6 space-y-2">

        <p>
          <strong>Steepness:</strong> {crag.steepness}
        </p>

        <p>
          <strong>Driving time:</strong> {crag.driving_time} min
        </p>

        <p>
          <strong>Walking time:</strong> {crag.walking_time} min
        </p>

      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">
          Description
        </h2>

        <p className="mt-2 whitespace-pre-line">
          {crag.description}
        </p>
      </div>
    </DetailsClientLayout>
  );
}