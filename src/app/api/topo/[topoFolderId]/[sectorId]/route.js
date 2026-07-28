import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(request, { params }) {
  try {
    const { topoFolderId, sectorId } = await params;

    const parsedTopoFolderId = Number(topoFolderId);
    const parsedSectorId = Number(sectorId);

    if (
      !Number.isInteger(parsedTopoFolderId) ||
      !Number.isInteger(parsedSectorId) ||
      parsedTopoFolderId <= 0 ||
      parsedSectorId <= 0
    ) {
      return Response.json(
        { error: "Invalid topo identifier." },
        { status: 400 }
      );
    }

    if (
      !supabaseUrl ||
      !supabaseAnonKey ||
      !supabaseServiceRoleKey
    ) {
      console.error("Missing Supabase server environment variables.");

      return Response.json(
        { error: "Server configuration error." },
        { status: 500 }
      );
    }

    /*
     * The browser sends:
     * Authorization: Bearer <the user's access token>
     */
    const authorization = request.headers.get("authorization");

    if (!authorization?.startsWith("Bearer ")) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    const accessToken = authorization.slice("Bearer ".length).trim();

    if (!accessToken) {
      return Response.json(
        { error: "Authentication required." },
        { status: 401 }
      );
    }

    /*
     * Verify the access token using the normal anon client.
     * Do not trust user information sent directly from the browser.
     */
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

    if (userError || !user) {
      return Response.json(
        { error: "Invalid or expired session." },
        { status: 401 }
      );
    }

    /*
     * The service-role client remains entirely on the server.
     */
    const adminClient = createClient(
      supabaseUrl,
      supabaseServiceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    /*
     * Look up the extension server-side.
     *
     * This prevents someone from passing arbitrary Storage paths
     * or filenames to the endpoint.
     */
    const { data: sector, error: sectorError } = await adminClient
      .from("sectors")
      .select(`
        sector_id,
        crag_id,
        parent_sector_id,
        sector_in_crag,
        topo_extension
      `)
      .eq("sector_id", parsedSectorId)
      .maybeSingle();

    if (sectorError) {
      console.error("Could not find topo sector:", sectorError);

      return Response.json(
        { error: "Could not load topo." },
        { status: 500 }
      );
    }

    if (!sector) {
      return Response.json(
        { error: "Topo sector not found." },
        { status: 404 }
      );
    }

    if (!sector.topo_extension) {
      return Response.json(
        { error: "Topo not found." },
        { status: 404 }
      );
    }

    const expectedFolderId =
      sector.parent_sector_id ?? sector.crag_id;

    if (parsedTopoFolderId !== Number(expectedFolderId)) {
      console.error("Invalid topo folder:", {
        requestedFolder: parsedTopoFolderId,
        expectedFolder: expectedFolderId,
        sectorId: sector.sector_id,
      });

      return Response.json(
        { error: "Invalid topo location." },
        { status: 403 }
      );
    }

    const extension = String(sector.topo_extension)
      .toLowerCase()
      .replace(/^\./, "");

    const allowedExtensions = new Set([
      "jpg",
      "jpeg",
      "png",
      "webp",
      "gif",
    ]);

    if (!allowedExtensions.has(extension)) {
      console.error("Unsupported topo extension:", extension);

      return Response.json(
        { error: "Unsupported topo format." },
        { status: 415 }
      );
    }

    const storagePath =
          `crags/${expectedFolderId}/` +
      `sector-${sector.sector_in_crag}.${extension}`;

      

    const { data: topoBlob, error: downloadError } =
      await adminClient.storage
        .from("topos")
        .download(storagePath);

    if (downloadError || !topoBlob) {
      console.error(
        "Could not download topo:",
        storagePath,
        downloadError
      );

      return Response.json(
        { error: "Topo not found." },
        { status: 404 }
      );
    }

    const originalImage = Buffer.from(
      await topoBlob.arrayBuffer()
    );

    const watermarkedImage = await addWatermark(
      originalImage,
      user.email ?? "private"
    );

    return new Response(watermarkedImage, {
      status: 200,
      headers: {
        "Content-Type": getContentType(extension),
        "Content-Disposition": "inline",
        "Cache-Control": "private, max-age=3600",
        "X-Content-Type-Options": "nosniff",
        Vary: "Authorization",
      },
    });
  } catch (error) {
    console.error("Unexpected topo API error:", error);

    return Response.json(
      { error: "Could not load topo." },
      { status: 500 }
    );
  }
}

async function addWatermark(imageBuffer, email) {
  const metadata = await sharp(imageBuffer).metadata();

  const width = metadata.width;
  const height = metadata.height;

  if (!width || !height) {
    throw new Error("Could not determine topo dimensions.");
  }

  const safeEmail = escapeSvgText(email);

  const fontSize = Math.max(
    12,
    Math.min(24, Math.round(width / 55))
  );

  const tileWidth = Math.max(
    220,
    Math.round(fontSize * 12)
  );

  const tileHeight = Math.max(
    120,
    Math.round(fontSize * 6)
  );

  const watermarkTile = Buffer.from(`
    <svg
      width="${tileWidth}"
      height="${tileHeight}"
      viewBox="0 0 ${tileWidth} ${tileHeight}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="${tileWidth / 2}"
        y="${tileHeight / 2}"
        transform="rotate(-28 ${tileWidth / 2} ${tileHeight / 2})"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${fontSize}"
        font-weight="600"
        fill="#ffffff"
        fill-opacity="0.24"
        stroke="#000000"
        stroke-opacity="0.18"
        stroke-width="0.8"
        paint-order="stroke"
      >
        ${safeEmail}
      </text>
    </svg>
  `);

  const pipeline = sharp(imageBuffer).composite([
    {
      input: watermarkTile,
      tile: true,
      blend: "over",
    },
  ]);

  switch (metadata.format) {
    case "jpeg":
      return pipeline
        .jpeg({
          quality: 90,
          mozjpeg: true,
        })
        .toBuffer();

    case "png":
      return pipeline
        .png({
          compressionLevel: 9,
          adaptiveFiltering: true,
        })
        .toBuffer();

    case "webp":
      return pipeline
        .webp({
          quality: 90,
        })
        .toBuffer();

    default:
      return pipeline
        .png({
          compressionLevel: 9,
          adaptiveFiltering: true,
        })
        .toBuffer();
  }
}

function escapeSvgText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function getContentType(extension) {
  const contentTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };

  return contentTypes[extension] ?? "application/octet-stream";
}