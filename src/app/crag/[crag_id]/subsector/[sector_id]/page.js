import CragDetailsClient from "@/components/CragDetailsClient";

export default async function SubsectorPage({ params }) {
  const { crag_id, sector_id } = await params;

  return (
    <CragDetailsClient
      cragId={Number(crag_id)}
      sectorId={Number(sector_id)}
    />
  );
}