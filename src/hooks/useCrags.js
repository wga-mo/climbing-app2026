import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useCrags() {
  const [crags, setCrags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCrags() {
      setLoading(true);

      const { data, error } = await supabase
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

      if (error) {
        console.error("Error fetching crags:", error);
        setCrags([]);
      } else {
        setCrags(data);
      }

      setLoading(false);
    }

    fetchCrags();
  }, []);

  return {
    crags,
    loading,
  };
}