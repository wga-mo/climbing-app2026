'use client';

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkUser() {
      if (pathname === "/login") {
        setLoading(false);
        return;
      }

      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/login");
        return;
      }

      setLoading(false);
    }

    checkUser();
  }, [router, pathname]);

  if (pathname === "/login") {
    return children;
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        Loading...
      </div>
    );
  }

  return children;
}