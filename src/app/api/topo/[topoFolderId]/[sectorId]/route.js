import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(request, { params }) {
  const totalStart = performance.now();
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

const authStart = performance.now();

    const {
      data: { user },
      error: userError,
    } = await authClient.auth.getUser(accessToken);

console.log(
  "Auth:",
  Math.round(performance.now() - authStart),
  "ms"
);

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

const profileStart = performance.now();

    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle();

      console.log(
  "Profile:",
  Math.round(performance.now() - profileStart),
  "ms"
);
    if (profileError) {
      console.error("Could not load watermark profile:", profileError);
    }

    const watermarkUser =
      user.email;

    /*
     * Look up the extension server-side.
     *
     * This prevents someone from passing arbitrary Storage paths
     * or filenames to the endpoint.
     */

const sectorStart = performance.now();

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
console.log(
  "Sector:",
  Math.round(performance.now() - sectorStart),
  "ms"
);
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

    if (!sector?.topo_extension) {
      return Response.json(
        { error: "Topo not found." },
        { status: 404 }
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

      
const downloadStart = performance.now();
    const { data: topoBlob, error: downloadError } =
      await adminClient.storage
        .from("topos")
        .download(storagePath);
console.log(
  "Download:",
  Math.round(performance.now() - downloadStart),
  "ms"
);
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

    const originalBytes = Buffer.from(
      await topoBlob.arrayBuffer()
    );

const watermarkStart = performance.now();
    const watermarkedImage = await addWatermark(
      originalBytes,
      watermarkUser,
      extension
    );
    console.log(
  "Watermark:",
  Math.round(performance.now() - watermarkStart),
  "ms"
);

console.log(
  "TOTAL:",
  Math.round(performance.now() - totalStart),
  "ms"
);
    return new Response(watermarkedImage.buffer, {
      status: 200,
      headers: {
        "Content-Type": getContentType(watermarkedImage.extension),

        /*
         * Tell the browser to display rather than suggest downloading.
         * This is not a hard security boundary, but is preferable.
         */
        "Content-Disposition": "inline",

        /*
         * Avoid long-lived browser, CDN and intermediary caches.
         */
        "Cache-Control":
          "private, no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",

        "X-Content-Type-Options": "nosniff",

        /*
         * The response differs based on the logged-in user token.
         */
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

async function addWatermark(
  imageBuffer,
  username,
  originalExtension
) {
  const image = sharp(imageBuffer, {
    failOn: "none",
  });

  const metadata = await image.metadata();

  const width = metadata.width;
  const height = metadata.height;

  if (!width || !height) {
    throw new Error(
      "Could not determine topo dimensions."
    );
  }

  const date = new Intl.DateTimeFormat("de-DE", {
    timeZone: "Europe/Oslo",
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const watermarkText =
    `${username}`;

  const svg = createWatermarkSvg({
    width,
    height,
    text: watermarkText,
  });

  /*
   * PNG preserves topo quality best.
   *
   * JPEG input is returned as JPEG.
   * PNG and WebP keep their original format.
   */
  let outputExtension = originalExtension;

  let pipeline = image.composite([
    {
      input: Buffer.from(svg),
      top: 0,
      left: 0,
    },
  ]);

  switch (originalExtension) {
    case "jpg":
    case "jpeg":
      pipeline = pipeline.jpeg({
        quality: 92,
        mozjpeg: true,
      });
      outputExtension = "jpg";
      break;

    case "webp":
      pipeline = pipeline.webp({
        quality: 92,
      });
      outputExtension = "webp";
      break;

    case "png":
    default:
      pipeline = pipeline.png({
        compressionLevel: 6,
      });
      outputExtension = "png";
      break;
  }

  const buffer = await pipeline.toBuffer();

  return {
    buffer,
    extension: outputExtension,
  };
}

function createWatermarkSvg({
  width,
  height,
  text,
}) {
  const safeText = escapeXml(text);

  const fontSize = Math.max(
    30,
    Math.round(width / 24)
  );

  const positions = [
    {
      x: width * 0.28,
      y: height * 0.3,
      rotation: -22,
    },
    {
      x: width * 0.72,
      y: height * 0.55,
      rotation: -22,
    },
    {
      x: width * 0.4,
      y: height * 0.82,
      rotation: -22,
    },
  ];

  const labels = positions.map(
    ({ x, y, rotation }) => `
      <text
        x="${x}"
        y="${y}"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="700"
        fill="white"
        fill-opacity="0.32"
        stroke="black"
        stroke-opacity="0.28"
        stroke-width="${Math.max(1, fontSize * 0.04)}"
        paint-order="stroke"
        text-anchor="middle"
        dominant-baseline="middle"
        transform="rotate(${rotation} ${x} ${y})"
      >
        ${safeText}
      </text>
    `
  );

  return `
    <svg
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
      xmlns="http://www.w3.org/2000/svg"
    >
      ${labels.join("")}
    </svg>
  `;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}