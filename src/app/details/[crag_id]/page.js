import { supabase } from "@/lib/supabase";
import FiltersSidebar from "@/components/FiltersSidebar";
import DetailsClientLayout from "@/components/DetailsClientLayout";
import SectorList from "@/components/SectorList";

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
      approach,
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

  const { data: sectors } = await supabase
  .from("sectors")
  .select(`
    sector_id,
    crag_id,
    name,
    description,
    orientation,
    steepness,
    walking_time,
    approach,
    link,
    comment,
    loc_lat,
    loc_long
  `)
  .eq("crag_id", crag_id)
  .order("sector_id");

const { data: routes } = await supabase
  .from("routes")
  .select(`
    route_id,
    name,
    grade_int,
    stars_int,
    length,
    style,
    pitches,
    sector_id,
    sector,
    sector_name
  `)
  .eq("crag_id", crag_id)
  .order("sector_id");

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

      <div className="mt-6">
        <h2 className="text-xl font-semibold">
          Approach
        </h2>

        <p className="mt-2 whitespace-pre-line">
          {crag.approach}
        </p>
      </div>

    <SectorList sectors={sectors} />


    </DetailsClientLayout>
  );
}