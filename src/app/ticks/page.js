"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function TicksPage() {
  const { user } = useAuth();
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);

  const columnDefs = useMemo(() => [
    {
      field: "tick_date",
      headerName: "Date",
      sort: "desc",
      width: 120,
    },
    {
      field: "route_name",
      headerName: "Route",
      flex: 1,
      minWidth: 150,
      cellRenderer: params => (
        <Link
          href={`/details/${params.data.crag_id}`}
          className="underline"
        >
          {params.value}
        </Link>
      ),
    },
    {
      field: "tick_type",
      headerName: "Type",
      width: 130,
    },
    {
      field: "note",
      headerName: "Note",
      flex: 1,
      minWidth: 180,
    },
  ], []);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  useEffect(() => {
    async function loadTicks() {
      if (!user) return;

      const { data, error } = await supabase
        .from("ticks")
        .select(`
          tick_id,
          tick_date,
          tick_type,
          note,
          routes (
            route_id,
            name,
            crag_id
          )
        `)
        .eq("user_id", user.id)
        .order("tick_date", { ascending: false });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const rows = (data || []).map(tick => ({
        tick_id: tick.tick_id,
        tick_date: tick.tick_date,
        tick_type: tick.tick_type,
        note: tick.note,
        route_id: tick.routes?.route_id,
        route_name: tick.routes?.name || "Unknown route",
        crag_id: tick.routes?.crag_id,
      }));

      setRowData(rows);
      setLoading(false);
    }

    loadTicks();
  }, [user]);

  if (!user) {
    return <main className="p-4">Please log in to see your ticks.</main>;
  }

  if (loading) {
    return <main className="p-4">Loading ticks...</main>;
  }

  return (
    <main className="h-full overflow-auto p-4">
      <h1 className="text-2xl font-semibold">My ticks</h1>

      <div className="ag-theme-quartz mt-4 h-[70vh] w-full">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={20}
        />
      </div>
    </main>
  );
}