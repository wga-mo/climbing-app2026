import { supabase } from "@/lib/supabase";
import DetailsClientLayout from "@/components/DetailsClientLayout";
import CragDetailsContent from "@/components/CragDetailsContent";

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
    nr_in_picture,
    sector_id,
    sector,
    sector_name
  `)
  .eq("crag_id", crag_id)
  .order("sector_id");

  return (
    <DetailsClientLayout>
      <CragDetailsContent
        crag={crag}
        sectors={sectors}
        routes={routes}
      />
    </DetailsClientLayout>
    
    
  );
}