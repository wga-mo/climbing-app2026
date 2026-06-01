'use client';

import { useFilters } from "@/context/FiltersContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { useEffect, useRef, useState } from "react";

export default function Navbar() {
  
  //Auth-profile related
  const router = useRouter();
  const { user, profile } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  
  const mobileMenuRef = useRef(null);
  const desktopMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      const clickedInsideMobile = mobileMenuRef.current?.contains(event.target);
      const clickedInsideDesktop = desktopMenuRef.current?.contains(event.target);

      if (!clickedInsideMobile && !clickedInsideDesktop) {
        setMenuOpen(false);
      }
    }
  
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const {
    filters,
    setFilters,
    setMobileFiltersVisible,
  } = useFilters();

  function toggleGlobalFilter() {
    setFilters(prev => ({
      ...prev,
      globalFilter: !prev.globalFilter,
    }));
  }

  async function handleLogout() {
    await supabase.auth.signOut();

    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-50 border-b bg-white shadow-sm">
      <nav className="flex h-14 items-center justify-between px-4">
        {/* Climing database title */}
        <div className="text-lg font-bold">
          <Link
              href="/"
            >
              Climbing Database
            </Link>
        </div>

        {/* Mobile screen setup */}
        <div className="flex items-center gap-3 lg:hidden">

          {/* Filters button*/}
          <button
            onClick={() => setMobileFiltersVisible(true)}
            className="rounded border px-3 py-1 text-sm"
          >
            Filters
          </button>

          {/* Filters toggle*/}
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
            <div className="relative" ref={mobileMenuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold"
              >
                {(profile?.username || user?.email)
                  ?.charAt(0)
                  .toUpperCase()}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-11 z-50 w-44 rounded-md border bg-white shadow-lg">
                  <div className="border-b px-3 py-2 text-sm font-medium">
                    {profile?.username || user?.email}
                  </div>

                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    Account
                  </Link>

                  <Link
                    href="/ticks"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    My ticks
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded border px-3 py-1 text-sm"
            >
              Log in
            </Link>
          )}
        </div>

        {/* Desktop screen setup */}
        <div className="hidden lg:block">
          {user ? (
            <div className="relative" ref={desktopMenuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-sm underline"
              >
                {profile?.username || user?.email}
              </button>

              {menuOpen && (
                <div className="absolute right-0 top-8 z-50 w-44 rounded-md border bg-white shadow-lg">
                  <div className="border-b px-3 py-2 text-sm font-medium">
                    {profile?.username || user?.email}
                  </div>

                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    Account
                  </Link>

                  <Link
                    href="/ticks"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 text-sm hover:bg-gray-100"
                  >
                    My ticks
                  </Link>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="rounded-md border px-3 py-1 text-sm ml-4"
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