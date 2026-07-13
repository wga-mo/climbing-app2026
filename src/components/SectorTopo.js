"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import ImageViewer from "./ImageViewer";

export default function SectorTopo({ sector, sectorId = null }) {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const isSectorPage = !!sectorId;

  const topoFolderId = isSectorPage
    ? sectorId
    : sector.crag_id;

  const hasTopo =
    !!sector.sector_in_crag &&
    !!sector.topo_extension;

  useEffect(() => {
    if (!hasTopo) {
      setImageUrl(null);
      return;
    }

    let cancelled = false;
    let objectUrl = null;

    async function loadTopo() {
      try {
        setImageUrl(null);
        setErrorMessage("");

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!session?.access_token) {
          throw new Error("You must be logged in to view this topo.");
        }

        const response = await fetch(
          `/api/topo/${topoFolderId}/${sector.sector_id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
            cache: "no-store",
          }
        );

        if (!response.ok) {
          let apiMessage = "";

          try {
            const result = await response.json();
            apiMessage = result?.error ?? "";
          } catch {
            // The response was not JSON.
          }

          throw new Error(
            apiMessage || `Could not load topo (${response.status}).`
          );
        }

        const imageBlob = await response.blob();

        if (!imageBlob.type.startsWith("image/")) {
          throw new Error("The server did not return a valid image.");
        }

        objectUrl = URL.createObjectURL(imageBlob);

        if (!cancelled) {
          setImageUrl(objectUrl);
        }
      } catch (error) {
        console.error("Topo loading failed:", error);

        if (!cancelled) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not load topo."
          );
        }
      }
    }

    loadTopo();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [
    hasTopo,
    topoFolderId,
    sector.sector_id,
  ]);

  if (!hasTopo) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded bg-gray-100 text-gray-500">
        No topo available
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded bg-gray-100 px-4 text-center text-gray-500">
        {errorMessage}
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded bg-gray-100 text-gray-500">
        Loading topo...
      </div>
    );
  }

  return (
    <>
      <img
        src={imageUrl}
        alt={`${sector.name} topo`}
        className="w-full cursor-zoom-in select-none rounded object-contain"
        draggable={false}
        onDragStart={(event) => event.preventDefault()}
        onContextMenu={(event) => event.preventDefault()}
        onClick={() => setOpen(true)}
      />

      <ImageViewer
        src={imageUrl}
        alt={`${sector.name} topo enlarged`}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}