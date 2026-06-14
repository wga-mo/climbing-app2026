import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { hostnameCrags } from "@/utils/hostnameCrags";
import { useAuth } from "@/context/AuthContext";

export function useCrags(filters) {
  const [crags, setCrags] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    async function fetchCrags() {
      setLoading(true);

      const { cragMin, cragMax } = hostnameCrags();

      const { data, error } = await supabase.rpc("crag_grade_summary", {
        grade_1_min: 1,
        grade_1_max: 9,
        grade_2_min: 10,
        grade_2_max: 12,
        grade_3_min: 13,
        grade_3_max: 17,
        grade_4_min: 18,
        grade_4_max: 22,
        grade_5_min: 23,
        grade_5_max: 28,
        grade_6_min: 29,
        grade_6_max: 34,

        sport: filters.globalFilter ? filters.sport : true,
        trad: filters.globalFilter ? filters.trad : true,
        boulder: filters.globalFilter ? filters.boulder : true,

        grade_min: filters.globalFilter ? filters.gradeMin : 0,
        grade_max: filters.globalFilter ? filters.gradeMax : 1000,

        p_s: filters.globalFilter ? filters.p_s : true,
        p_m: filters.globalFilter ? filters.p_m : true,

        d_time: filters.globalFilter ? filters.d_time : 1000,
        w_time: filters.globalFilter ? filters.w_time : 1000,

        oslo: filters.oslo,
        bergen: filters.bergen,
      });

      if (error) {
        console.error("Error fetching crag grade summary:", error);
        setCrags([]);
        setLoading(false);
        return;
      }

      const filteredData = (data || []).filter(
        crag =>
          crag.crag_id >= cragMin &&
          crag.crag_id <= cragMax
      );

      const cragIds = filteredData.map(crag => crag.crag_id);

      if (cragIds.length === 0) {
        setCrags([]);
        setLoading(false);
        return;
      }

      const locationSource = user
        ? "locations"
        : "public_location_preview";

      // Fetch location data for the filtered crags (only crag locations, not sector or parking locations)
      const { data: locationData, error: locationError } = await supabase
        .from(locationSource)
        .select("location_id, crag_id, sector_id, type, lat, lng, comment")
        .in("crag_id", cragIds)
        .is("sector_id", null)
        .eq("type", "crag");

      if (locationError) {
        console.error("Error fetching locations:", locationError);
      }

      // Create a map of crag_id to location for easy lookup
      const locationByCragId = new Map(
        (locationData || []).map(location => [
          location.crag_id,
          location,
        ])
      );
      
      // Merge location data into crag data
      const cragsWithLocations = filteredData.map(crag => ({
        ...crag,
        location: locationByCragId.get(crag.crag_id) || null,
      }));

      setCrags(cragsWithLocations);
      setLoading(false);
    }

    fetchCrags();
  }, [filters, user, authLoading]);

  return { crags, loading };
}