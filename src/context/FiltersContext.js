'use client';

import { createContext, useContext, useState } from "react";

const FiltersContext = createContext(null);

export function FiltersProvider({ children }) {
  const [filters, setFilters] = useState({
    region: "all",
    maxDrivingTime: 120,
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