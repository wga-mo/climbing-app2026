import { NextResponse } from "next/server";

import { requireAdmin } from "@/lib/server/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request) {
  const admin = await requireAdmin(request);

  if (!admin.authorized) {
    return NextResponse.json(
      { error: admin.error },
      { status: admin.status }
    );
  }

  const { count: totalEvents, error: totalError } =
    await supabaseAdmin
      .from("analytics_events")
      .select("*", {
        count: "exact",
        head: true,
      });

  if (totalError) {
    console.error(totalError);

    return NextResponse.json(
      { error: "Could not load analytics." },
      { status: 500 }
    );
  }

  // Calculate event counts for today, last 7 days, and last 30 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const sevenDays = new Date();
  sevenDays.setDate(sevenDays.getDate() - 7);

  const thirtyDays = new Date();
  thirtyDays.setDate(thirtyDays.getDate() - 30);

  async function countSince(date) {
    const { count } = await supabaseAdmin
      .from("analytics_events")
      .select("*", {
        count: "exact",
        head: true,
      })
      .gte("created_at", date.toISOString());

    return count ?? 0;
  }

  const [
    todayEvents,
    last7Days,
    last30Days,
  ] = await Promise.all([
    countSince(today),
    countSince(sevenDays),
    countSince(thirtyDays),
  ]);

  // Fetch top crags based on "crag_view" events in the last 30 days, excluding admin visits
  const { data: cragViewEvents, error: cragViewsError } =
    await supabaseAdmin
      .from("analytics_events")
      .select(`
        crag_id,
        crags (
          crag_name
        )
      `)
      .eq("event_name", "crag_view")
      .eq("is_admin", false)
      .not("crag_id", "is", null)
      .gte("created_at", thirtyDays.toISOString());

  if (cragViewsError) {
    console.error(cragViewsError);

    return NextResponse.json(
      { error: "Could not load crag analytics." },
      { status: 500 }
    );
  }

  const cragCounts = {};

  for (const event of cragViewEvents) {
    const cragId = event.crag_id;

    if (!cragCounts[cragId]) {
      cragCounts[cragId] = {
        cragId,
        name: event.crags?.crag_name ?? `Crag ${cragId}`,
        views: 0,
      };
    }

    cragCounts[cragId].views += 1;
  }

  const topCrags = Object.values(cragCounts)
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);  


  // Table with all events
  const {
    data: recentActivity,
    error: activityError,
  } = await supabaseAdmin
    .from("analytics_events")
    .select(`
      event_id,
      event_name,
      user_id,
      anonymous_id,
      username,
      page_path,
      crag_id,
      sector_id,
      route_id,
      hostname,
      is_admin,
      properties,
      created_at,
      crags(crag_name),
      sectors(name)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (activityError) {
    console.error(activityError);

    return NextResponse.json(
      { error: "Could not load activity." },
      { status: 500 }
    );
  }
  
  return NextResponse.json({
    summary: {
      totalEvents,
      todayEvents,
      last7Days,
      last30Days,
    },
    topCrags,
    recentActivity,
  });
}