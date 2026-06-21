"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useFilters } from "@/context/FiltersContext";
import FiltersSidebar from "@/components/FiltersSidebar";

export default function DetailsClientLayout({ children }) {
  const { filters, setFilters } = useFilters();

  const scrollRef = useRef(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasRouteTarget = searchParams.has("route");
  const storageKey = `scroll:${pathname}`;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || hasRouteTarget) return;

    const savedScroll = sessionStorage.getItem(storageKey);

    if (savedScroll !== null) {
      requestAnimationFrame(() => {
        el.scrollTop = Number(savedScroll);
      });
    }

    function saveScroll() {
      sessionStorage.setItem(storageKey, String(el.scrollTop));
    }

    el.addEventListener("scroll", saveScroll);

    return () => {
      saveScroll();
      el.removeEventListener("scroll", saveScroll);
    };
  }, [storageKey, hasRouteTarget]);

  return (
    <main className="flex flex-1 min-h-0 overflow-hidden">
      <div className="hidden lg:flex">
        <FiltersSidebar
          filters={filters}
          setFilters={setFilters}
          mode="details"
        />
      </div>

      <section
        ref={scrollRef}
        className="flex-1 overflow-auto px-4 pb-4 pt-0"
      >
        {children}
      </section>
    </main>
  );
}