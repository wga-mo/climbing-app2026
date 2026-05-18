'use client';

import { useFilters } from "@/context/FiltersContext";
import { doesRouteMatchFilters } from "@/utils/doesRouteMatchFilters";
import SectorDetailsSection from "@/components/SectorDetailsSection";
import { gradeConversion } from "@/utils/gradeConversion";

//Pass user into route table in order to enable ticking
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import TickModal from "@/components/TickModal";

export default function SectorRouteTables({ sectors, routes }) {
  const { filters } = useFilters();
  
  //Ticks
  const { user } = useAuth();
  const [ticks, setTicks] = useState([]);
  const [tickType, setTickType] = useState("climbed");
  const [note, setNote] = useState("");
  const [toast, setToast] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [tickDate, setTickDate] = useState(
      new Date().toISOString().slice(0, 10)
  );

  //Load ticks for current user
  useEffect(() => {
    async function loadTicks() {
      if (!user) return;

      const { data, error } = await supabase
        .from("ticks")
        .select("tick_id, route_id, route_id, tick_type, tick_date, note, created_at" )
        .eq("user_id", user.id)
        .order("tick_date", { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      setTicks(data);
    }

    loadTicks();
  }, [user]);

  const tickCounts = ticks.reduce((acc, tick) => {
    acc[tick.route_id] =
      (acc[tick.route_id] || 0) + 1;

    return acc;
  }, {});

  const selectedRouteTicks = selectedRoute
  ? ticks.filter(
      tick =>
        tick.route_id === selectedRoute.route_id
    )
  : [];

  async function submitTick() {
    if (!user || !selectedRoute) return;

    const { error } = await supabase
      .from("ticks")
      .insert({
        user_id: user.id,
        route_id: selectedRoute.route_id,
        tick_type: tickType,
        tick_date: tickDate,
        note,
      });

    if (error) {
      console.error(error);
      setToast("Could not save tick");
      return;
    }

    setTicks(prev => [
      ...prev,
      {
        route_id: selectedRoute.route_id,
        tick_type: tickType,
        tick_date: tickDate,
        note,
      },
    ]);

    setSelectedRoute(null);
    setNote("");
    setTickType("climbed");
    setToast("Tick saved");

    setTimeout(() => setToast(""), 2500);
  }
  

  return (
    <section className="mt-8 space-y-6">
      {sectors.map(sector => {
        const sectorRoutes = routes.filter(
          route => route.sector_id === sector.sector_id
        );

        const visibleRoutes = sectorRoutes.filter(
          route => doesRouteMatchFilters(route, filters)
        );

        if (!visibleRoutes.length) {
          return null;
        }

        return (
          <SectorDetailsSection
            key={sector.sector_id}
            sector={sector}
          >
            <table className="mt-4 w-full table-fixed border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  <th className="w-8 py-2 text-left">#</th>

                  <th className="py-2 text-left">
                    Name
                  </th>

                  <th className="w-14 py-2 text-left">
                    Grade
                  </th>

                  <th className="hidden md:table-cell w-20 py-2 text-left">
                    Style
                  </th>

                  <th className="hidden md:table-cell w-16 py-2 text-left">
                    Length
                  </th>

                  <th className="w-14 py-2 text-left">Tick</th>
                </tr>
              </thead>

              <tbody>
                {visibleRoutes.map(route => (
                  <tr key={route.route_id} className="border-b">
                    <td className="py-3 align-top">
                      {route.nr_in_picture}
                    </td>

                    <td className="py-3 pr-2">
                      <div className="break-words font-medium">
                        {route.name}
                      </div>

                      {/* Mobile-only secondary info */}
                      <div className="text-xs text-gray-500 md:hidden">
                        {route.style}
                        {route.length > 0 && ` • ${route.length}m`}
                      </div>
                    </td>

                    <td className="py-3 align-top">
                      {gradeConversion(route.grade_int)}
                    </td>

                    <td className="hidden md:table-cell py-3">
                      {route.style}
                    </td>

                    <td className="hidden md:table-cell py-3">
                      {route.length}
                    </td>

                    <td className="py-3 align-top">
                      {user && (
                        <button
                      onClick={() => setSelectedRoute(route)}
                      className="rounded border px-2 py-1 text-xs hover:bg-gray-100"
                    >
                      {tickCounts[route.route_id] ? `+ (${tickCounts[route.route_id]})` : "+"}
                    </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </SectorDetailsSection>
        );
      })}

      <TickModal
        selectedRoute={selectedRoute}
        selectedRouteTicks={selectedRouteTicks}
        tickDate={tickDate}
        setTickDate={setTickDate}
        tickType={tickType}
        setTickType={setTickType}
        note={note}
        setNote={setNote}
        onCancel={() => setSelectedRoute(null)}
        onSubmit={submitTick}
      />

      // Toast notification
        {toast && (
          <div className="fixed bottom-4 right-4 z-[9999] rounded bg-black px-4 py-2 text-sm text-white shadow-lg">
            {toast}
          </div>
        )}
    </section>
    
  );
  
}