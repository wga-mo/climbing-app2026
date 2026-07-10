'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SectorTopo({ sector, sectorId = null }) {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const hasTopo = !!sector.sector_in_crag && !!sector.topo_extension;

  const isSectorPage = !!sectorId;
  
  const path = isSectorPage
    ? `crags/${sectorId}/sector-${sector.sector_in_crag}.${sector.topo_extension}`
    : `crags/${sector.crag_id}/sector-${sector.sector_in_crag}.${sector.topo_extension}`;
  
  useEffect(() => {
    if (!hasTopo) return;

    let cancelled = false;

    async function loadTopo() {
    try {
      setImageUrl(null);
      setErrorMessage("");

      const { data, error } =
        await supabase.storage
          .from("topos")
          .createSignedUrl(path, 3600);

      if (error) throw error;

      setImageUrl(data.signedUrl);
    } catch (err) {
      console.error("Topo loading failed:", err);
      setErrorMessage("Could not load topo.");
    }
  }

  loadTopo();
}, [
  hasTopo,
  sector.crag_id,
  sector.sector_in_crag,
  sector.topo_extension
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
      <div className="flex h-[300px] items-center justify-center rounded bg-gray-100 text-gray-500">
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
        className="w-full cursor-zoom-in rounded object-contain"
        onClick={() => setOpen(true)}
      />

      {open && (
        <div className="fixed inset-0 z-[99999] bg-black/90 p-4">
          <button
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded bg-white px-3 py-1 text-sm"
          >
            Close
          </button>

          <div className="flex h-full items-center justify-center overflow-auto pt-10">
            <img
              src={imageUrl}
              alt={`${sector.name} topo enlarged`}
              className="max-h-none max-w-none rounded"
            />
          </div>
        </div>
      )}
    </>
  );
}