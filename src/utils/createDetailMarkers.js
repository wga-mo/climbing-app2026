export function createDetailMarkers({
  crag,
  locations,
  allSectors,
}) {
  const sectorById = new Map(
    (allSectors || []).map((sector) => [
      sector.sector_id,
      sector,
    ])
  );

  return (locations || [])
    .filter(
      (location) =>
        Number.isFinite(Number(location.lat)) &&
        Number.isFinite(Number(location.lng))
    )
    .map((location) => ({
      id: `location-${location.location_id}`,
      locationId: location.location_id,
      sectorId: location.sector_id,
      label:
        location.type === "crag"
          ? crag.crag_name
          : location.type?.startsWith("parking")
            ? location.comment || "Parking"
            : location.type === "sector" ||
                location.type === "wall"
              ? sectorById.get(location.sector_id)?.name ||
                "Sector"
              : location.comment ||
                location.type,

      lat: Number(location.lat),
      lng: Number(location.lng),
      type: location.type,

      href:
        location.sector_id &&
        location.type === "sector"
          ? `/crag/${crag.crag_id}/sector/${location.sector_id}`
          : null,
    }));
}