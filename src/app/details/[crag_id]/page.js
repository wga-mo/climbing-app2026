import AuthGuard from "@/components/AuthGuard";
import CragDetailsClient from "@/components/CragDetailsClient";

export default async function CragDetailsPage({ params }) {
  const { crag_id } = await params;

  return (
    <AuthGuard>
      <CragDetailsClient cragId={crag_id} />
    </AuthGuard>
  );
}