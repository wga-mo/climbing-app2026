'use client';

import { createContext, useContext, useState } from "react";

const FiltersContext = createContext(null);

export function FiltersProvider({ children }) {
  const [filters, setFilters] = useState({
    globalFilter: true,

    sport: true,
    trad: false,
    boulder: false,

    gradeMin: 8,
    gradeMax: 21,

    p_s: true,
    p_m: false,

    d_time: 120,
    w_time: 45,

    oslo: true,
    bergen: false,
  });

  return (
    <FiltersContext.Provider value={{ filters, setFilters }}>
      {children}
    </FiltersContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FiltersContext);

  if (!context) {
    throw new Error("useFilters must be used inside FiltersProvider");
  }

  return context;
}