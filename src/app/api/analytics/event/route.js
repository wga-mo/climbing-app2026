import { NextResponse } from "next/server";

import {
  getAuthenticatedUserId,
  getProfileData,
} from "@/lib/server/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const parsed = Number(value);

  return Number.isInteger(parsed) &&
    parsed > 0
    ? parsed
    : null;
}

function cleanUuid(value) {
  return typeof value === "string" &&
    UUID_PATTERN.test(value)
    ? value
    : null;
}

function cleanHostname(value) {
  if (typeof value !== "string") {
    return null;
  }

  const hostname = value
    .trim()
    .toLowerCase()
    .slice(0, 255);

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

function cleanPagePath(value) {
  if (typeof value !== "string") {
    return null;
  }

  const path = value.slice(0, 500);

  return path.startsWith("/")
    ? path
    : null;
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

  if (serialized.length > 10_000) {
    return {};
  }

  return value;
}

function createDedupeKey({
  eventName,
  hostname,
  cragId,
  sectorId,
  routeId,
  userId,
  anonymousId,
}) {
  const thirtyMinuteBucket = Math.floor(
    Date.now() / (30 * 60 * 1000)
  );

  const visitorKey = userId
    ? `user:${userId}`
    : `anonymous:${anonymousId}`;

  return [
    eventName,
    hostname ?? "",
    cragId ?? "",
    sectorId ?? "",
    routeId ?? "",
    visitorKey,
    thirtyMinuteBucket,
  ].join("|");
}

export async function POST(request) {
  try {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error(
        "Missing Supabase environment variables for analytics."
      );

      return NextResponse.json(
        {
          error:
            "Server configuration error",
        },
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
        {
          error:
            "Unsupported analytics event",
        },
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

    const cragId =
      cleanInteger(body.cragId);

    const sectorId =
      cleanInteger(body.sectorId);

    const routeId =
      cleanInteger(body.routeId);

    const anonymousId =
      cleanUuid(body.anonymousId);

    const sessionId =
      cleanUuid(body.sessionId);

    const hostname =
      cleanHostname(body.hostname);

    const userId =
      await getAuthenticatedUserId(request);

    if (!userId && !anonymousId) {
      return NextResponse.json(
        {
          error:
            "Visitor could not be identified",
        },
        { status: 400 }
      );
    }

    const {
      isAdmin,
      username,
    } = await getProfileData(userId);

    const event = {
      event_name: eventName,
      user_id: userId,
      is_admin: isAdmin,
      username,
      anonymous_id: anonymousId,
      session_id: sessionId,
      hostname,
      page_path:
        cleanPagePath(body.pagePath),
      crag_id: cragId,
      sector_id: sectorId,
      route_id: routeId,
      properties:
        cleanProperties(body.properties),
      dedupe_key: null,
    };

    if (VIEW_EVENTS.has(eventName)) {
      event.dedupe_key = createDedupeKey({
        eventName,
        hostname,
        cragId,
        sectorId,
        routeId,
        userId,
        anonymousId,
      });
    }

    const { error: insertError } =
      await supabaseAdmin
        .from("analytics_events")
        .insert(event);

    if (insertError) {
      if (
        insertError.code === "23505" &&
        event.dedupe_key
      ) {
        return NextResponse.json({
          success: true,
          recorded: false,
          reason: "duplicate",
        });
      }

      console.error(
        "Analytics insert failed:",
        insertError
      );

      return NextResponse.json(
        {
          error:
            "Could not record analytics event",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      recorded: true,
    });
  } catch (error) {
    console.error(
      "Analytics API error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Invalid analytics request",
      },
      { status: 400 }
    );
  }
}