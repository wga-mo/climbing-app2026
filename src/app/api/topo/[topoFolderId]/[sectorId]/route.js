import { createClient } from "@supabase/supabase-js";
import sharp from "sharp";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(request, { params }) {
  try {
    console.log("Runtime versions:", {
      node: process.version,
      sharp: sharp.versions,
      platform: process.platform,
      arch: process.arch,
    });

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

    const metadata = await sharp(originalImage).metadata();

console.log(metadata);



    const watermarkedImage = await addWatermark(
      originalImage,
      user.email ?? "private"
    );

    const outputMetadata = await sharp(watermarkedImage).metadata();

console.log("Generated output:", {
  format: outputMetadata.format,
  width: outputMetadata.width,
  height: outputMetadata.height,
  bytes: watermarkedImage.length,
  signature: watermarkedImage.subarray(0, 12).toString("hex"),
});

   const debugExtension =
  outputMetadata.format === "jpeg"
    ? "jpg"
    : outputMetadata.format;

await adminClient.storage
  .from("topos")
  .upload(
    "debug/vercel-output.jpg",
    watermarkedImage,
    {
      contentType: "image/jpeg",
      upsert: true,
    }
  );

console.log("Debug upload:", uploadError);

    try {
      const metadata = await sharp(watermarkedImage).metadata();

      console.log("Generated image metadata:", metadata);
    } catch (err) {
      console.error("Sharp cannot read generated image:", err);
    }
    

    return new Response(originalImage, {
  headers: {
    "Content-Type": "image/png",
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

async function addWatermark(imageBuffer) {
  return sharp(imageBuffer)
    .jpeg({
      quality: 92,
      mozjpeg: true,
    })
    .toBuffer();
}

function escapeSvgText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function getContentType(format) {
  const contentTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };

  return contentTypes[format] ?? "application/octet-stream";
}