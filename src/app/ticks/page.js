"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { gradeConversion } from "@/utils/gradeConversion";


import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

ModuleRegistry.registerModules([AllCommunityModule]);

export default function TicksPage() {
  const { user } = useAuth();
  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);

  function DashboardCard({ label, value }) {
  return (
    <div className="rounded border bg-white p-3 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}
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
      field: "crag_name",
      headerName: "Crag",
      flex: 1,
      minWidth: 150,
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
            grade_int,
            crag_id,
            crags (
              crag_name
            )
          )
        `)
        .eq("user_id", user.id)
        .order("tick_date", { ascending: false });

      if (error) {
        console.error('Error fetching ticks:', error);
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
        grade: gradeConversion(tick.routes?.grade_int) || "Unknown grade",
        crag_id: tick.routes?.crag_id,
        crag_name: tick.routes?.crags?.crag_name || "Unknown crag",
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

  const recentTicks = rowData.slice(0, 10);

const totalTicks = rowData.length;

const uniqueRoutes = new Set(
  rowData.map(row => row.route_id).filter(Boolean)
).size;

const currentYear = new Date().getFullYear();

const ticksThisYear = rowData.filter(row => {
  if (!row.tick_date) return false;
  return new Date(row.tick_date).getFullYear() === currentYear;
}).length;

const mostRecentDate = rowData[0]?.tick_date || "-";

const gradeCounts = rowData.reduce((acc, row) => {
  if (!row.grade) return acc;
  acc[row.grade] = (acc[row.grade] || 0) + 1;
  return acc;
}, {});
console.log('Grade counts:', gradeCounts);
const gradeHistogram = Object.entries(gradeCounts)
  .map(([grade, count]) => ({ grade, count }))
  .sort((a, b) => a.grade.localeCompare(b.grade, "no", { numeric: true }));

  const maxGradeCount = Math.max(
  ...gradeHistogram.map(item => item.count),
  1
);
console.log('Gradehistogram:', gradeHistogram);
  return (
  <main className="h-full overflow-auto p-4">
    <h1 className="text-2xl font-semibold">My ticks</h1>

    <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
      <DashboardCard label="Total ticks" value={totalTicks} />
      <DashboardCard label="This year" value={ticksThisYear} />
      <DashboardCard label="Unique routes" value={uniqueRoutes} />
      <DashboardCard label="Latest tick" value={mostRecentDate} />
    </section>

    <section className="mt-6">
      <h2 className="text-lg font-semibold">Ticks by grade</h2>
      
      <div className="mt-3 space-y-2">
        {gradeHistogram.map(item => (
          <div key={item.grade} className="flex items-center gap-3">
            <div className="w-12 text-sm">{item.grade}</div>

            <div className="h-5 flex-1 rounded bg-gray-100">
              <div
                className="h-5 rounded bg-gray-400"
                style={{
                  width: `${(item.count / maxGradeCount) * 100}%`,
                }}
              />
            </div>

            <div className="w-8 text-right text-sm">{item.count}</div>
          </div>
        ))}
      </div>
    </section>

    <section className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Recent ticks</h2>
        <a href="#all-ticks" className="text-sm underline">
          Show all
        </a>
      </div>

      <div className="mt-2 overflow-x-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-3 py-2 text-left">Date</th>
              <th className="px-3 py-2 text-left">Route</th>
              <th className="px-3 py-2 text-left">Crag</th>
              <th className="px-3 py-2 text-left">Grade</th>
              <th className="px-3 py-2 text-left">Type</th>
            </tr>
          </thead>
          <tbody>
            {recentTicks.map(tick => (
              <tr key={tick.tick_id} className="border-t">
                <td className="px-3 py-2">{tick.tick_date}</td>
                <td className="px-3 py-2">
                  <Link
                    href={`/details/${tick.crag_id}`}
                    className="underline"
                  >
                    {tick.route_name}
                  </Link>
                </td>
                <td className="px-3 py-2">
                  <Link
                    href={`/details/${tick.crag_id}`}
                    className="underline"
                  >
                    {tick.crag_name}
                  </Link>
                </td>
                <td className="px-3 py-2">{tick.grade || "-"}</td>
                <td className="px-3 py-2">{tick.tick_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>

    <section id="all-ticks" className="mt-8">
      <h2 className="text-lg font-semibold">All ticks</h2>

      <div className="ag-theme-quartz mt-4 h-[70vh] w-full">
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          pagination={true}
          paginationPageSize={20}
        />
      </div>
    </section>
  </main>
);
}