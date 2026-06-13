import CragDetailsClient from "@/components/CragDetailsClient";

export default async function CragPage({ params }) {
  const { crag_id } = await params;

  return (
    
    <CragDetailsClient cragId={Number(crag_id)} />
    
  );
}

