'use client';

import { useEffect, useState } from "react";
import DetailsClientLayout from "@/components/DetailsClientLayout";
import CragDetailsContent from "@/components/CragDetailsContent";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

export default function CragDetailsClient({ cragId, sectorId = null }) {
  const [crag, setCrag] = useState(null);
  const [sectors, setSectors] = useState([]);
  const [allSectors, setAllSectors] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [guidebooks, setGuidebooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentSector, setCurrentSector] = useState(null);
  const [showSectorCards, setShowSectorCards] = useState(false);

  const [locations, setLocations] = useState([]);

  const { user, loading: authLoading } = useAuth();
  // console.log('user', user);

  const userId = user?.id ?? null;

  useEffect(() => {
    if (authLoading) return;

    async function fetchDetails() {
      setLoading(true);

      const cragSource = userId ? "crags" : "public_crag_preview";
      const sectorSource = userId ? "sectors" : "public_sector_preview";
      const routeSource = userId ? "routes" : "public_route_preview";
      const locationSource = userId ? "locations" : "public_location_preview";

      // Fetch crag data
      const { data: cragData, error: cragError } = await supabase
        .from(cragSource)
        .select(`
          crag_id,
          crag_name,
          country,
          region,
          area,
          description,
          driving_directions,
          approach,
          driving_time,
          walking_time,
          rainproof,
          campsite,
          bathing,
          buss_friendly
        `)
        .eq("crag_id", cragId)
        .single();

      if (cragError || !cragData) {
        console.log("Error fetching crag details:", cragError);
        setCrag(null);
        setLoading(false);
        return;
      }

      // Fetch location data for the crag
      const { data: locationData, error: locationError } = await supabase
        .from(locationSource)
        .select("location_id, crag_id, sector_id, type, lat, lng, comment")
        .eq("crag_id", cragId);

      if (locationError) {
        console.log("Error fetching locations:", locationError);
        setLocations([]);
      } else {
        setLocations(locationData || []);
      }

      // Fetch sector data
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
          topo_extension,
          parent_sector_id,
          sector_type
        `)
        .eq("crag_id", cragId)
        .order("sector_in_crag");

        
      if (sectorError || !sectorData) {
        console.log("Error fetching sector details:", sectorError);
        setSectors([]);
        setLoading(false);
        return;
      }

      let displayedSectors = [];
      let pageSector = null;
      let shouldShowSectorCards = false;

      if (sectorId) {
        pageSector = sectorData.find(
          (s) => s.sector_id === sectorId
        );

        displayedSectors = sectorData.filter(
          (s) => s.parent_sector_id === sectorId
        );

        shouldShowSectorCards = false;
      } else {
        displayedSectors = sectorData.filter(
          (s) => s.parent_sector_id === null
        );

        shouldShowSectorCards = displayedSectors.some(
          (s) => s.sector_type === "sector"
        );
      }

      console.log("Page sector:", pageSector);
      console.log("Displayed sectors:", displayedSectors);

      setCurrentSector(pageSector || null);
      setSectors(displayedSectors);
      setShowSectorCards(shouldShowSectorCards);

      // Fetch route data
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
          sector_name,
          comment
        `)
        .eq("crag_id", cragId)
        .order("nr_in_picture");

      if (routeError || !routeData) {
        console.log("Error fetching route details:", routeError);
        setRoutes([]);
        setLoading(false);
        return;
      }

      // Fetch guidebook data
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
      setAllSectors(sectorData || []);
      setRoutes(routeData || []);
      setGuidebooks(guidebookData || []);
      setLoading(false);
    }

    fetchDetails();
  }, [cragId, sectorId, userId, authLoading]);

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
        currentSector={currentSector}
        sectors={sectors}
        allSectors={allSectors}
        routes={routes}
        guidebooks={guidebooks}
        locations={locations}
        sectorId={sectorId}
        showSectorCards={showSectorCards}
      />
    </DetailsClientLayout>
  );
}