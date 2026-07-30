"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

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
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl p-6">
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
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-3xl font-bold">
        Analytics
      </h1>

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