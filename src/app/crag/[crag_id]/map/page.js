import CragMapClient from "@/components/CragMapClient";

export default async function CragMapPage({
  params,
  searchParams,
}) {
  const { crag_id } = await params;
  const { sector } = await searchParams;

  const cragId = Number(crag_id);
  const sectorId = sector ? Number(sector) : null;

  return (
    <CragMapClient
      cragId={cragId}
      sectorId={sectorId}
    />
  );
}