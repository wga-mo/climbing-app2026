import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useCrags(filters) {
  const [crags, setCrags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCrags() {
      setLoading(true);

      let query = supabase
        .from("crags")
        .select(`
          crag_id,
          crag_name,
          country,
          region,
          area,
          driving_time,
          walking_time
        `)
        .order("crag_name");

      if (filters.region !== "all") {
        query = query.eq("region", filters.region);
      }

      query = query.lte("driving_time", filters.maxDrivingTime);

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching crags:", error);
        setCrags([]);
      } else {
        setCrags(data);
      }

      setLoading(false);
    }

    fetchCrags();
  }, [filters]);

  return { crags, loading };
}