'use client';

import { useEffect, useState } from "react";
import DetailsClientLayout from "@/components/DetailsClientLayout";
import CragDetailsContent from "@/components/CragDetailsContent";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function CragDetailsClient({ cragId }) {
  const [crag, setCrag] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [guidebooks, setGuidebooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const {user} = useAuth();
  const cragSource = user ? "crags" : "public_crag_preview";
  const sectorSource = user ? "sectors" : "public_sector_preview";
  const routeSource = user ? "routes" : "public_route_preview";

  useEffect(() => {
    async function fetchDetails() {
      setLoading(true);
        
      const { data: cragData, error: cragError } = await supabase
        .from(cragSource)
        .select(`
          crag_id,
          crag_name,
          country,
          region,
          area,
          description,
          driving_time,
          walking_time,
          rainproof,
          campsite,
          bathing,
          buss_friendly,
          loc_lat,
          loc_long,
          par_lat,
          par_long
        `)
        .eq("crag_id", cragId)
        .single();

      if (cragError || !cragData) {
        setCrag(null);
        setLoading(false);
        return;
      }

      const { data: sectorData } = await supabase
        .from(sectorSource)
        .select(`
          sector_id,
          crag_id,
          sector_in_crag,
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
        .eq("crag_id", cragId)
        .order("sector_in_crag");

      const { data: routeData } = await supabase
        .from(routeSource)
        .select(`
          route_id,
          name,
          grade_int,
          stars_int,
          length,
          bolts,
          style,
          pitches,
          nr_in_picture,
          sector_id,
          sector,
          sector_name
        `)
        .eq("crag_id", cragId)
        .order("nr_in_picture");

      const { data: guidebookData } = await supabase
        .from("link_crags_guidebooks")
        .select(`
          page,
          primary_book,
          guidebooks (
            name
          )
        `)
        .eq("crag_id", cragId);

      setCrag(cragData);
      setSectors(sectorData || []);
      setRoutes(routeData || []);
      setGuidebooks(guidebookData || []);
      setLoading(false);
    }

    fetchDetails();
  }, [cragId]);

  if (loading) {
    return (
      <DetailsClientLayout>
        <p>Loading crag...</p>
      </DetailsClientLayout>
    );
  }

  if (!crag) {
    return (
      <DetailsClientLayout>
        <h1 className="text-2xl font-bold">Crag not found</h1>
      </DetailsClientLayout>
    );
  }

  return (
    <DetailsClientLayout>
      <CragDetailsContent
        crag={crag}
        sectors={sectors}
        routes={routes}
        guidebooks={guidebooks}
      />
    </DetailsClientLayout>
  );
}