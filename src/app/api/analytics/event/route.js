import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const ALLOWED_EVENTS = new Set([
"home_view",
  "crag_view",
  "sector_view",
  "route_view",
  "filters_applied",
  "search_performed",
  "tick_created",
  "topo_opened",
  "map_opened",
]);

const VIEW_EVENTS = new Set([
  "home_view",
  "crag_view",
  "sector_view",
  "route_view",
]);

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validNullableId(value) {
  return (
    value === null ||
    value === undefined ||
    (Number.isInteger(value) && value > 0)
  );
}

function cleanInteger(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function cleanUuid(value) {
  return typeof value === "string" && UUID_PATTERN.test(value)
    ? value
    : null;
}

function cleanPagePath(value) {
  if (typeof value !== "string") {
    return null;
  }

  const path = value.slice(0, 500);

  return path.startsWith("/") ? path : null;
}

function cleanHostname(value) {
  if (typeof value !== "string") {
    return null;
  }

  const hostname = value.trim().toLowerCase().slice(0, 255);

  if (
    !hostname ||
    hostname.includes("/") ||
    hostname.includes("\\") ||
    /\s/.test(hostname)
  ) {
    return null;
  }

  return hostname;
}

function cleanProperties(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return {};
  }

  const serialized = JSON.stringify(value);

  // Prevent excessively large analytics requests.
  if (serialized.length > 10_000) {
    return {};
  }

  return value;
}

export async function POST(request) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error(
            "Missing Supabase environment variables for analytics."
        );

        return NextResponse.json(
            { error: "Server configuration error" },
            { status: 500 }
        );
    }

    const body = await request.json();

    const eventName = body.eventName;

    if (
      typeof eventName !== "string" ||
      !ALLOWED_EVENTS.has(eventName)
    ) {
      return NextResponse.json(
        { error: "Unsupported analytics event" },
        { status: 400 }
      );
    }

    if (
      !validNullableId(body.cragId) ||
      !validNullableId(body.sectorId) ||
      !validNullableId(body.routeId)
    ) {
      return NextResponse.json(
        { error: "Invalid entity ID" },
        { status: 400 }
      );
    }

    const cragId = cleanInteger(body.cragId);
    const sectorId = cleanInteger(body.sectorId);
    const routeId = cleanInteger(body.routeId);

    const anonymousId = cleanUuid(body.anonymousId);
    const sessionId = cleanUuid(body.sessionId);

    let userId = null;
    let isAdmin = false;

    const authorization = request.headers.get("authorization");

    if (authorization?.startsWith("Bearer ")) {
    const accessToken = authorization
        .slice("Bearer ".length)
        .trim();

    if (accessToken) {
        const authClient = createClient(
        supabaseUrl,
        supabaseAnonKey,
        {
            auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
            },
        }
        );

        const {
        data: { user },
        error: userError,
        } = await authClient.auth.getUser(accessToken);

        if (userError) {
        if (process.env.NODE_ENV === "development") {
            console.warn(
            "Analytics authentication failed:",
            userError
            );
        }
        } else {
            userId = user?.id ?? null;

            if (userId) {
                const { data: profile, error: profileError } =
                await supabaseAdmin
                    .from("profiles")
                    .select("is_admin")
                    .eq("id", userId)
                    .maybeSingle();

                if (profileError) {
                console.error(
                    "Analytics profile lookup failed:",
                    profileError
                );
                } else {
                isAdmin = profile?.is_admin === true;
                }
            }
            }
    }
    }

    if (!userId && !anonymousId) {
      return NextResponse.json(
        { error: "Visitor could not be identified" },
        { status: 400 }
      );
    }

    const event = {
      event_name: eventName,
      user_id: userId,
      is_admin: isAdmin,
      anonymous_id: anonymousId,
      session_id: sessionId,

      hostname: cleanHostname(body.hostname),
      page_path: cleanPagePath(body.pagePath),

      crag_id: cragId,
      sector_id: sectorId,
      route_id: routeId,
      properties: cleanProperties(body.properties),
    };

    /*
     * Avoid counting repeated rendering, React development effects,
     * refreshes and quick back/forward navigation as new views.
     */
    if (VIEW_EVENTS.has(eventName)) {
      const thirtyMinutesAgo = new Date(
        Date.now() - 30 * 60 * 1000
      ).toISOString();

      let duplicateQuery = supabaseAdmin
        .from("analytics_events")
        .select("event_id")
        .eq("event_name", eventName)
        .gte("created_at", thirtyMinutesAgo)
        .limit(1);

      if (event.hostname === null) {
        duplicateQuery = duplicateQuery.is("hostname", null);
      } else {
        duplicateQuery = duplicateQuery.eq("hostname", event.hostname);
     }

      if (cragId === null) {
        duplicateQuery = duplicateQuery.is("crag_id", null);
      } else {
        duplicateQuery = duplicateQuery.eq("crag_id", cragId);
      }

      if (sectorId === null) {
        duplicateQuery = duplicateQuery.is("sector_id", null);
      } else {
        duplicateQuery = duplicateQuery.eq("sector_id", sectorId);
      }

      if (routeId === null) {
        duplicateQuery = duplicateQuery.is("route_id", null);
      } else {
        duplicateQuery = duplicateQuery.eq("route_id", routeId);
      }

      if (userId) {
        duplicateQuery = duplicateQuery.eq("user_id", userId);
      } else {
        duplicateQuery = duplicateQuery
          .is("user_id", null)
          .eq("anonymous_id", anonymousId);
      }

      const {
        data: duplicate,
        error: duplicateError,
      } = await duplicateQuery.maybeSingle();

      if (duplicateError) {
        console.error(
          "Analytics duplicate check failed:",
          duplicateError
        );

        return NextResponse.json(
          { error: "Could not record analytics event" },
          { status: 500 }
        );
      }

      if (duplicate) {
        return NextResponse.json({
          success: true,
          recorded: false,
          reason: "duplicate",
        });
      }
    }

    const { error: insertError } = await supabaseAdmin
      .from("analytics_events")
      .insert(event);

    if (insertError) {
      console.error("Analytics insert failed:", insertError);

      return NextResponse.json(
        { error: "Could not record analytics event" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recorded: true,
    });
  } catch (error) {
    console.error("Analytics API error:", error);

    return NextResponse.json(
      { error: "Invalid analytics request" },
      { status: 400 }
    );
  }
}