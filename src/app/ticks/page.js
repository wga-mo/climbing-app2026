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

function DashboardCard({ label, value }) {
  return (
    <div className="rounded border bg-white p-3 shadow-sm">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

export default function TicksPage() {
  const { user } = useAuth();

  const [rowData, setRowData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("thisYear");
  const [showAttempts, setShowAttempts] = useState(false);
  const [showClimbed, setShowClimbed] = useState(false);

  const cleanSendTypes = [
    "onsight",
    "flash",
    "redpoint",
    "repeat",
  ];

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
          href={params.data.href}
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
      field: "grade",
      headerName: "Grade",
      width: 100,
    },
    {
      field: "tick_type",
      headerName: "Type",
      width: 130,
    },
    {
      field: "belayer",
      headerName: "Belayer",
      width: 140,
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
          belayer,
          note,
          routes (
            route_id,
            name,
            sector_id,
            grade_int,
            crag_id,
            crags (
              crag_name
            ),
            sectors (
              parent_sector_id)
          )
        `)
        .eq("user_id", user.id)
        .order("tick_date", { ascending: false });

     
      if (error) {
        console.error("Error fetching ticks:", error);
        setLoading(false);
        return;
      }

      //Find all parentSectorIds (without duplicates)
      const parentSectorIds = [
        ...new Set(
          (data || [])
            .map((tick) => tick.routes?.sectors?.parent_sector_id)
            .filter(Boolean)
        ),
      ];
      
      //Fetch names for parent sectors
      const { data: parentSectors, error: parentSectorsError } = await supabase
        .from("sectors")
        .select("sector_id, name")
        .in("sector_id", parentSectorIds);

      if (parentSectorsError) {
        console.error("Error fetching parent sectors:", parentSectorsError);
      }

      const parentSectorById = Object.fromEntries(
        (parentSectors || []).map((sector) => [sector.sector_id, sector])
      );

      const rows = (data || []).map((tick) => {
      const route = tick.routes;
      const sector = route?.sectors;
      const parentSectorId = sector?.parent_sector_id;
      const parentSector = parentSectorById[parentSectorId];

      return {
        tick_id: tick.tick_id,
        tick_date: tick.tick_date,
        tick_type: tick.tick_type,
        belayer: tick.belayer,
        note: tick.note,

        route_id: route?.route_id,
        route_name: route?.name || "Unknown route",
        grade_int: route?.grade_int,
        grade: gradeConversion(route?.grade_int) || "Unknown grade",

        crag_id: route?.crag_id,
        crag_name: route?.crags?.crag_name || "Unknown crag",

        sector_id: route?.sector_id,
        parent_sector_id: parentSectorId,
        parent_sector_name: parentSector?.name,

        crag_href: `/crag/${route?.crag_id}`,

        sector_href: parentSectorId
          ? `/crag/${route?.crag_id}/sector/${parentSectorId}`
          : null,

        href: parentSectorId
          ? `/crag/${route?.crag_id}/sector/${parentSectorId}?route=${route?.route_id}`
          : `/crag/${route?.crag_id}?route=${route?.route_id}`,
      };
    });

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

  function isInSelectedTimePeriod(row) {
    if (!row.tick_date) return false;
    if (timeFilter === "all") return true;

    const tickDate = new Date(row.tick_date);
    const now = new Date();

    if (timeFilter === "thisYear") {
      return tickDate.getFullYear() === now.getFullYear();
    }

    if (timeFilter === "thisMonth") {
      return (
        tickDate.getFullYear() === now.getFullYear() &&
        tickDate.getMonth() === now.getMonth()
      );
    }

    return true;
  }

  const timeFilteredRows = rowData.filter(isInSelectedTimePeriod);

  const attemptRows = timeFilteredRows.filter(
    row => row.tick_type === "attempt"
  );

  const climbedRows = timeFilteredRows.filter(
    row => row.tick_type === "climbed"
  );

  const visibleRows = timeFilteredRows.filter(row => {
    if (cleanSendTypes.includes(row.tick_type)) return true;
    if (row.tick_type === "attempt") return showAttempts;
    if (row.tick_type === "climbed") return showClimbed;
    return false;
  });

  const recentTicks = visibleRows.slice(0, 10);

  const totalTicks = visibleRows.length;

  const uniqueRoutes = new Set(
    visibleRows.map(row => row.route_id).filter(Boolean)
  ).size;

  const mostRecentDate = visibleRows[0]?.tick_date || "-";

  const tickTypes = [
    "onsight",
    "flash",
    "redpoint",
    "repeat",
    ...(showClimbed ? ["climbed"] : []),
    ...(showAttempts ? ["attempt"] : []),
  ];

  const tickTypeColors = {
    onsight: "bg-green-500",
    flash: "bg-blue-500",
    redpoint: "bg-red-500",
    repeat: "bg-purple-400",
    climbed: "bg-yellow-400",
    attempt: "bg-gray-400",
  };

  const gradeHistogram = Object.values(
    visibleRows.reduce((acc, row) => {
      if (
        !row.grade ||
        row.grade === "Unknown grade" ||
        row.grade_int == null
      ) {
        return acc;
      }

      if (!acc[row.grade_int]) {
        acc[row.grade_int] = {
          grade: row.grade,
          grade_int: row.grade_int,
          total: 0,
          counts: {},
        };
      }

      acc[row.grade_int].total += 1;
      acc[row.grade_int].counts[row.tick_type] =
        (acc[row.grade_int].counts[row.tick_type] || 0) + 1;

      return acc;
    }, {})
  ).sort((a, b) => a.grade_int - b.grade_int);

  const maxGradeCount = Math.max(
    ...gradeHistogram.map(item => item.total),
    1
  );

  return (
    <main className="h-full overflow-auto p-4">
      <h1 className="text-2xl font-semibold">My ticks</h1>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm">
          Period
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="rounded border px-2 py-1 text-sm"
          >
            <option value="thisMonth">This month</option>
            <option value="thisYear">This year</option>
            <option value="all">All</option>
          </select>
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showClimbed}
            onChange={(e) => setShowClimbed(e.target.checked)}
          />
          Show climbed
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={showAttempts}
            onChange={(e) => setShowAttempts(e.target.checked)}
          />
          Show attempts
        </label>
      </div>

      <section className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-5">
        <DashboardCard label="Ticks shown" value={totalTicks} />
        <DashboardCard label="Unique routes" value={uniqueRoutes} />
        <DashboardCard label="Climbed" value={climbedRows.length} />
        <DashboardCard label="Attempts" value={attemptRows.length} />
        <DashboardCard label="Latest tick" value={mostRecentDate} />
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">Ticks by grade</h2>

        <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-600">
          {tickTypes.map(type => (
            <div key={type} className="flex items-center gap-1">
              <span className={`h-3 w-3 rounded ${tickTypeColors[type]}`} />
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>

        {gradeHistogram.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            No ticks in this selection.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {gradeHistogram.map(item => (
              <div key={item.grade_int} className="flex items-center gap-3">
                <div className="w-16 text-sm">{item.grade}</div>

                <div className="h-5 flex-1 overflow-hidden rounded bg-gray-100">
                  <div
                    className="flex h-5"
                    style={{
                      width: `${(item.total / maxGradeCount) * 100}%`,
                    }}
                  >
                    {tickTypes.map(type => {
                      const count = item.counts[type] || 0;
                      if (count === 0) return null;

                      return (
                        <div
                          key={type}
                          className={tickTypeColors[type]}
                          style={{
                            width: `${(count / item.total) * 100}%`,
                          }}
                          title={`${type}: ${count}`}
                        />
                      );
                    })}
                  </div>
                </div>

                <div className="w-8 text-right text-sm">
                  {item.total}
                </div>
              </div>
            ))}
          </div>
        )}
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
                    <Link href={tick.href} className="underline">
                      {tick.route_name}
                    </Link>
                  </td>

                  <td className="px-3 py-2">
                    <Link href={tick.crag_href} className="underline">
                      {tick.crag_name} 
                    </Link>

                    {tick.sector_href && tick.parent_sector_name && (
                      <>
                        {" - "}
                        <Link href={tick.sector_href} className="underline">
                          {tick.parent_sector_name}
                        </Link>
                      </>
                    )}
                  </td>

                  <td className="px-3 py-2">
                    {tick.grade || "-"}
                  </td>

                  <td className="px-3 py-2 capitalize">
                    {tick.tick_type}
                  </td>
                </tr>
              ))}

              {recentTicks.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="px-3 py-4 text-center text-sm text-gray-500"
                  >
                    No ticks in this selection.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section id="all-ticks" className="mt-8">
        <h2 className="text-lg font-semibold">All ticks</h2>

        <div className="ag-theme-quartz mt-4 h-[70vh] w-full">
          <AgGridReact
            theme="legacy"
            rowData={visibleRows}
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