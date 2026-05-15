'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SectorTopo({ sector }) {
  const [open, setOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  if (!sector.sector_in_crag) {
    return (
      <div className="flex h-[300px] items-center justify-center rounded bg-gray-100 text-gray-500">
        No topo available
      </div>
    );
  }

  const topoPath = `crags/${sector.crag_id}/sector-${sector.sector_in_crag}.png`;

  useEffect(() => {
    async function loadTopo() {
      setImageUrl(null);
      setErrorMessage("");

      const { data, error } = await supabase.storage
        .from("topos")
        .createSignedUrl(topoPath, 60 * 60);

      if (error) {
        console.error("Error loading topo:", error);
        setErrorMessage("Could not load topo.");
        return;
      }

      setImageUrl(data.signedUrl);
    }

    loadTopo();
  }, [topoPath]);

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