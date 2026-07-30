"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [topCrags, setTopCrags] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [excludeAdmin, setExcludeAdmin] = useState(true);
  const [selectedHostnames, setSelectedHostnames] = useState([]);
  const [error, setError] = useState("");

  const visibleActivity = recentActivity.filter((event) => {
  if (excludeAdmin && event.is_admin) {
    return false;
  }

  if (!selectedHostnames.includes(event.hostname)) {
    return false;
  }

  return true;
});
  
  const hostnames = [
    ...new Set(recentActivity.map((event) => event.hostname)),
  ]
    .filter(Boolean)
    .sort();
    
  useEffect(() => {
    const saved = localStorage.getItem("admin_analytics_hostnames");

    if (saved) {
      setSelectedHostnames(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const savedValue = localStorage.getItem(
      "admin_analytics_exclude_admin"
    );

    if (savedValue !== null) {
      setExcludeAdmin(savedValue === "true");
    }
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const accessToken =
        session?.access_token ?? null;

      const response = await fetch(
        "/api/admin/analytics",
        {
          headers: accessToken
            ? {
                Authorization: `Bearer ${accessToken}`,
              }
            : {},
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? "Unknown error");
        setLoading(false);
        return;
      }

      setSummary(data.summary);
      setTopCrags(data.topCrags ?? []);

      const activity = data.recentActivity ?? [];

      setRecentActivity(activity);

      const saved = localStorage.getItem("admin_analytics_hostnames");

      if (!saved) {
        const hostnames = [
          ...new Set(activity.map((event) => event.hostname)),
        ]
          .filter(Boolean)
          .sort();

        setSelectedHostnames(hostnames);

        localStorage.setItem(
          "admin_analytics_hostnames",
          JSON.stringify(hostnames)
        );
      }

      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-screen-2xl p-6">
        Loading analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-5xl p-6 text-red-600">
        {error}
      </div>
    );
  }

  
  return (
    <div className="mx-auto max-w-screen-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Analytics
      </h1>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total events"
          value={summary.totalEvents}
        />

        <StatCard
          title="Today"
          value={summary.todayEvents}
        />

        <StatCard
          title="Last 7 days"
          value={summary.last7Days}
        />

        <StatCard
          title="Last 30 days"
          value={summary.last30Days}
        />
      </div>

      {/* All events table */}
      <section className="mt-10">
        <h2 className="mb-2 text-2xl font-bold">
          Activity
        </h2>

        <p className="mb-4 text-sm text-gray-500">
          Latest 100 analytics events.
        </p>

        {/*Exclude admin checkbox*/}
        <label className="mb-4 flex items-center gap-2">
          <input
            type="checkbox"
            checked={excludeAdmin}
            onChange={(event) => {
              const checked = event.target.checked;

              setExcludeAdmin(checked);

              localStorage.setItem(
                "admin_analytics_exclude_admin",
                String(checked)
              );
            }}
          />

          <span>Exclude admin activity</span>
        </label>

        {/*Hostname checkboxes*/}
        <div className="mb-4">
          <div className="mb-2 font-medium">Hostnames</div>

          <div className="flex flex-wrap gap-4">
            {hostnames.map((hostname) => (
              <label key={hostname} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedHostnames.includes(hostname)}
                  onChange={() => {
                    let updated;

                    if (selectedHostnames.includes(hostname)) {
                      updated = selectedHostnames.filter((h) => h !== hostname);
                    } else {
                      updated = [...selectedHostnames, hostname];
                    }

                    setSelectedHostnames(updated);

                    localStorage.setItem(
                      "admin_analytics_hostnames",
                      JSON.stringify(updated)
                    );
                  }}
                />
                <span>{hostname}</span>
              </label>
            ))}
          </div>
        </div>

        {/* The table itself*/}
        {visibleActivity.length === 0 ? (
          <p className="text-gray-500">
            No activity found.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full whitespace-nowrap text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-3 py-3">
                    Time
                  </th>

                  <th className="px-3 py-3">
                    Event
                  </th>

                  <th className="px-3 py-3">
                    Visitor
                  </th>

                  <th className="px-3 py-3">
                    Page
                  </th>

                  <th className="px-3 py-3">
                    Crag
                  </th>

                  <th className="px-3 py-3">
                    Sector
                  </th>

                  <th className="px-3 py-3">
                    Hostname
                  </th>

                  <th className="px-3 py-3">
                    Admin
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleActivity.map((event) => (
                  <tr
                    key={event.event_id}
                    className="border-t"
                  >
                    <td className="px-3 py-3">
                      {formatDate(event.created_at)}
                    </td>

                    <td className="px-3 py-3 font-medium">
                      {event.event_name}
                    </td>

                    <td className="px-3 py-3">
                      {getVisitorName(event)}
                    </td>

                    <td className="max-w-72 truncate px-3 py-3">
                      {event.page_path ?? "—"}
                    </td>

                    <td className="px-3 py-3">
                      {event.crags?.crag_name ?? "—"}
                    </td>

                    <td className="px-3 py-3">
                      {event.sectors?.name ?? "—"}
                    </td>

                    <td className="px-3 py-3">
                      {event.hostname ?? "—"}
                    </td>

                    <td className="px-3 py-3">
                      {event.is_admin ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </section>

      {/* Top crags */}
      <section className="mt-10">
        <h2 className="mb-4 text-2xl font-bold">
          Top crags
        </h2>

        <p className="mb-4 text-sm text-gray-500">
          Most viewed crags during the last 30 days,
          excluding admin visits.
        </p>

        {topCrags.length === 0 ? (
          <p className="text-gray-500">
            No crag views found.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3">
                    Crag
                  </th>

                  <th className="px-4 py-3 text-right">
                    Views
                  </th>
                </tr>
              </thead>

              <tbody>
                {topCrags.map((crag) => (
                  <tr
                    key={crag.cragId}
                    className="border-t"
                  >
                    <td className="px-4 py-3">
                      {crag.name}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {crag.views}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="rounded-lg border p-6 shadow-sm">
      <div className="text-sm text-gray-500">
        {title}
      </div>

      <div className="mt-2 text-3xl font-bold">
        {value}
      </div>
    </div>
  );
}

function formatDate(value) {
  return new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
}

function getVisitorName(event) {
  if (event.username) {
    return event.username;
  }

  if (event.user_id) {
    return "Logged in";
  }

  if (event.anonymous_id) {
    return `Anonymous ${event.anonymous_id.slice(0, 8)}`;
  }

  return "Unknown";
}