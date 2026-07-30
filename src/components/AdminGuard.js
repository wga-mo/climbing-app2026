"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminGuard({ children }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/");
      return;
    }

    // Only redirect after a profile actually exists.
    if (profile && profile.is_admin !== true) {
      router.replace("/");
    }
  }, [loading, user, profile, router]);

  if (loading || (user && !profile)) {
    return (
      <div className="mx-auto max-w-5xl p-6">
        Loading...
      </div>
    );
  }

  if (!user || profile?.is_admin !== true) {
    return null;
  }

  return children;
}