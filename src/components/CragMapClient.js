"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MapView from "@/components/MapView";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { createDetailMarkers } from "@/utils/createDetailMarkers";

export default function CragMapClient({
  cragId,
  sectorId = null,
}) {
  const [crag, setCrag] = useState(null);
  const [locations, setLocations] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (authLoading) return;

    async function fetchMapData() {
      setLoading(true);
      setError(null);

      const cragSource = userId
        ? "crags"
        : "public_crag_preview";

      const sectorSource = userId
        ? "sectors"
        : "public_sector_preview";

      const locationSource = userId
        ? "locations"
        : "public_location_preview";

      const [
        { data: cragData, error: cragError },
        { data: locationData, error: locationError },
        { data: sectorData, error: sectorError },
      ] = await Promise.all([
        supabase
          .from(cragSource)
          .select("crag_id, crag_name")
          .eq("crag_id", cragId)
          .single(),

        supabase
          .from(locationSource)
          .select(
            "location_id, crag_id, sector_id, type, lat, lng, comment"
          )
          .eq("crag_id", cragId),

        supabase
          .from(sectorSource)
          .select(
            "sector_id, crag_id, name, parent_sector_id, sector_type"
          )
          .eq("crag_id", cragId)
          .order("sector_in_crag"),
      ]);

      if (cragError) {
        console.error("Error fetching crag:", cragError);
        setError("Could not load the crag.");
        setCrag(null);
        setLoading(false);
        return;
      }

      if (locationError) {
        console.error(
          "Error fetching locations:",
          locationError
        );
      }

      if (sectorError) {
        console.error(
          "Error fetching sectors:",
          sectorError
        );
      }

      setCrag(cragData);
      setLocations(locationData || []);
      setSectors(sectorData || []);
      setLoading(false);
    }

    fetchMapData();
  }, [cragId, userId, authLoading]);

  const markers = useMemo(() => {
    if (!crag) return [];

    return createDetailMarkers({
      crag,
      locations,
      allSectors: sectors,
    });
  }, [crag, locations, sectors]);

  const currentSector = useMemo(() => {
    if (!sectorId) return null;

    return sectors.find(
      (sector) => sector.sector_id === sectorId
    );
  }, [sectors, sectorId]);

  const backHref = sectorId
    ? `/crag/${cragId}/sector/${sectorId}#map`
    : `/crag/${cragId}#map`;

  if (authLoading || loading) {
    return (
      <main className="flex flex-1 items-center justify-center">
        <p>Loading map...</p>
      </main>
    );
  }

  if (error || !crag) {
    return (
      <main className="p-4">
        <p>{error || "Crag not found."}</p>

        <Link
          href={backHref}
          className="mt-4 inline-block underline"
        >
          Back
        </Link>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-0 flex-1">
      <MapView
        markers={markers}
        mode="fullscreen"
      />

      <div className="absolute left-3 top-3 z-[1000] flex max-w-[calc(100%-1.5rem)] items-center gap-2">
        <Link
          href={backHref}
          className="shrink-0 rounded-md border bg-white px-3 py-2 text-sm shadow"
        >
          ← Back
        </Link>

        <div className="truncate rounded-md border bg-white px-3 py-2 text-sm shadow">
          <span className="font-medium">
            {crag.crag_name}
          </span>

          {currentSector && (
            <span> / {currentSector.name}</span>
          )}
        </div>
      </div>
    </main>
  );
}