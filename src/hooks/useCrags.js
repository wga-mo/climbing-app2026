import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useCrags(filters) {
  const [crags, setCrags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCrags() {
      setLoading(true);

      const hostname = window.location.hostname;
      console.log("Hostname:", hostname);

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
      } else {
        setCrags(data || []);
      }
      setLoading(false);
    }

    fetchCrags();
  }, [filters]);

  return { crags, loading };
}