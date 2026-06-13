'use client';

import { useEffect, useState } from "react";
import DetailsClientLayout from "@/components/DetailsClientLayout";
import CragDetailsContent from "@/components/CragDetailsContent";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function CragDetailsClient({ cragId, sectorId = null }) {
  const [crag, setCrag] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [guidebooks, setGuidebooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user, loading: authLoading } = useAuth();
  // console.log('user', user);

  useEffect(() => {
    if (authLoading) return;

    async function fetchDetails() {
      setLoading(true);

      const cragSource = user ? "crags" : "public_crag_preview";
      const sectorSource = user ? "sectors" : "public_sector_preview";
      const routeSource = user ? "routes" : "public_route_preview";

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
        console.log("Error fetching crag details:", cragError);
        setCrag(null);
        setLoading(false);
        return;
      }

      const { data: sectorData, error: sectorError } = await supabase
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
          loc_long,
          topo_extension
        `)
        .eq("crag_id", cragId)
        .order("sector_in_crag");

      if (sectorError || !sectorData) {
        console.log("Error fetching sector details:", sectorError);
        setSectors([]);
        setLoading(false);
        return;
      }

      const { data: routeData, error: routeError } = await supabase
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

      if (routeError || !routeData) {
        console.log("Error fetching route details:", routeError);
        setRoutes([]);
        setLoading(false);
        return;
      }

      const { data: guidebookData } = await supabase
        .from("link_crags_guidebooks")
        .select(`
          book_id,
          page,
          primary_book,
          guidebooks (
            name,
            link
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
  }, [cragId, user, authLoading]);

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