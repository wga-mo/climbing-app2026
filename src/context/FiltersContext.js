'use client';

import { createContext, useContext, useEffect, useState } from "react";

const FiltersContext = createContext(null);

const FILTER_STORAGE_KEY = "climbing_filters_v1";

export const defaultFilters = {
  globalFilter: true,
  sport: true,
  trad: false,
  boulder: false,
  gradeMin: 10,
  gradeMax: 19,
  p_s: true,
  p_m: false,
  d_time: 120,
  w_time: 45,
  selectedRegions: ["Oslo"],
};

export function FiltersProvider({ children }) {
  const [filters, setFilters] = useState(defaultFilters);
  const [filtersLoaded, setFiltersLoaded] = useState(false);

  const [activeMobileView, setActiveMobileView] = useState("table");
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const [previousMobileView, setPreviousMobileView] = useState("table");

  useEffect(() => {
    try {
      const storedFilters = localStorage.getItem(FILTER_STORAGE_KEY);

      if (storedFilters) {
        setFilters({
          ...defaultFilters,
          ...JSON.parse(storedFilters),
        });
      }
    } catch (error) {
      console.error("Could not load filters:", error);
    } finally {
      setFiltersLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!filtersLoaded) return;

    localStorage.setItem(
      FILTER_STORAGE_KEY,
      JSON.stringify(filters)
    );
  }, [filters, filtersLoaded]);

  if (!filtersLoaded) {
    return null;
  }

  return (
    <FiltersContext.Provider
      value={{
        filters,
        setFilters,
        activeMobileView,
        setActiveMobileView,
        mobileFiltersVisible,
        setMobileFiltersVisible,
        previousMobileView,
        setPreviousMobileView,
      }}
    >
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