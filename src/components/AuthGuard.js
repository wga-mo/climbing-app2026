'use client';

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        setAllowed(false);
        setCheckingAuth(false);

        router.replace(
          `/login?next=${encodeURIComponent(pathname)}`
        );

        return;
      }

      setAllowed(true);
      setCheckingAuth(false);
    }

    checkUser();
  }, [router, pathname]);

  if (checkingAuth) {
    return (
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-8">
        <p>Checking login...</p>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-8">
        <div className="text-center">
          <p className="text-lg font-medium">Login required</p>
          <p className="mt-2 text-sm text-gray-600">
            Redirecting to login...
          </p>
        </div>
      </main>
    );
  }

  return children;
}