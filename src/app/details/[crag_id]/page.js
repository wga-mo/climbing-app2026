import CragDetailsClient from "@/components/CragDetailsClient";

export default async function CragDetailsPage({ params }) {
  const { crag_id } = await params;

  return (
    
    <CragDetailsClient cragId={crag_id} />
    
  );
}