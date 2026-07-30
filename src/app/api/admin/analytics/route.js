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

  return NextResponse.json({
    summary: {
      totalEvents,
      todayEvents,
      last7Days,
      last30Days,
    },
  });
}