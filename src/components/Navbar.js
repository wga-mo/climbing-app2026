'use client';

import { useFilters } from "@/context/FiltersContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Navbar() {
  
  const {
    filters,
    setFilters,
    setMobileFiltersVisible,
  } = useFilters();

  //Auth-profile related
  const router = useRouter();
  const [user, setUser] = useState(null);

  function toggleGlobalFilter() {
    setFilters(prev => ({
      ...prev,
      globalFilter: !prev.globalFilter,
    }));
  }

  useEffect(() => {
  async function getUser() {
    const { data } =
      await supabase.auth.getUser();

    setUser(data.user);
  }

  getUser();

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user ?? null);
    }
  );

  return () =>
    subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b bg-white">
      <nav className="flex h-14 items-center justify-between px-4">
        <div className="text-lg font-bold">
          Climbing Database
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <button
            onClick={() => setMobileFiltersVisible(true)}
            className="rounded border px-3 py-1 text-sm"
          >
            Filters
          </button>

          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              checked={filters.globalFilter}
              onChange={toggleGlobalFilter}
              className="peer sr-only"
            />

            <div className="h-5 w-10 rounded-full bg-gray-300 peer-checked:bg-black" />

            <div className="absolute left-1 top-1 h-3 w-3 rounded-full bg-white transition peer-checked:translate-x-5" />
          </label>

          {user ? (
            <button
              onClick={handleLogout}
              className="rounded border px-3 py-1 text-sm"
            >
              Log out
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded border px-3 py-1 text-sm"
            >
              Log in
            </Link>
          )}
        </div>

        <div className="hidden lg:block">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {user.email}
              </span>

              <button
                onClick={handleLogout}
                className="rounded-md border px-3 py-1 text-sm"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-md border px-3 py-1 text-sm"
            >
              Log in
            </Link>
          )}
        </div>

      </nav>
    </header>
  );
}