"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import MapView from "@/components/MapView";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { createDetailMarkers } from "@/utils/createDetailMarkers";
import { getDatabaseSources } from "@/utils/getDatabaseSources";

export default function CragMapClient({
  cragId,
  sectorId = null,
}) {
  const [crag, setCrag] = useState(null);
  const [locations, setLocations] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [paths, setPaths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, loading: authLoading, profile } = useAuth();
  const userId = user?.id ?? null;
  const isAdmin = profile?.is_admin ?? false;

  const sources = getDatabaseSources(Boolean(userId));

  useEffect(() => {
    if (authLoading) return;

    async function fetchMapData() {
      setLoading(true);
      setError(null);

      const [
        { data: cragData, error: cragError },
        { data: locationData, error: locationError },
        { data: sectorData, error: sectorError },
        { data: pathsData, error: pathsError },
      ] = await Promise.all([
        supabase
          .from(sources.crags)
          .select("crag_id, crag_name")
          .eq("crag_id", cragId)
          .single(),

        supabase
          .from(sources.locations)
          .select(
            "location_id, crag_id, sector_id, type, lat, lng, comment"
          )
          .eq("crag_id", cragId),

        supabase
          .from(sources.sectors)
          .select(
            "sector_id, crag_id, name, parent_sector_id, sector_type"
          )
          .eq("crag_id", cragId)
          .order("sector_in_crag"),
          
        supabase
          .from(sources.paths)
          .select("path_id, name, path_type, geometry")
          .eq("crag_id", cragId),
      ]);

      if (cragError) {
        console.error("Error fetching crag:", cragError);
        setError("Could not load the crag.");
        setCrag(null);
        setLoading(false);
        return;
      }

      if (locationError) {
        console.error("Error fetching locations:", locationError);
      }

      if (sectorError) {
        console.error("Error fetching sectors:", sectorError);
      }

      if (pathsError) {
        console.error("Error fetching map paths:", pathsError);
      }

      setCrag(cragData);
      setLocations(locationData || []);
      setSectors(sectorData || []);
      setPaths(pathsData || []);
      setLoading(false);
    }

    fetchMapData();
    

  }, [cragId, userId, authLoading]);

  console.log("Paths fetched:", paths);

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

  async function handleSavePath({ name, points }) {
    const geometry = {
        type: "Feature",
        properties: {},
        geometry: {
        type: "LineString",
        coordinates: points.map(([lat, lng]) => [
            lng,
            lat,
        ]),
        },
    };

    const { data, error } = await supabase
        .from(sources.paths)
        .insert({
        crag_id: cragId,
        name,
        path_type: "path",
        geometry,
        })
        .select()
        .single();

    if (error) {
        throw error;
    }

    setPaths(current => [
        ...current,
        data,
    ]);
  }

  return (
    <main className="relative flex min-h-0 flex-1">
      <MapView
        markers={markers}
        paths={paths ?? []}
        mode="fullscreen"
        isAdmin={isAdmin}
        onSavePath={handleSavePath}
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