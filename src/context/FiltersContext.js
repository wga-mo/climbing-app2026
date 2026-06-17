'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const FiltersContext = createContext(null);

const FILTER_STORAGE_KEY = "climbing_filters_v1";

export const defaultFilters = {
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
};

export function FiltersProvider({ children }) {
  const [filters, setFilters] = useState(defaultFilters);
  const [filtersLoaded, setFiltersLoaded] = useState(false);

  const [activeMobileView, setActiveMobileView] = useState("table");
  const [mobileFiltersVisible, setMobileFiltersVisible] = useState(false);
  const [previousMobileView, setPreviousMobileView] = useState("table");

  // Load stored filters only after hydration
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
      console.error("Could not load filters from localStorage:", error);
    } finally {
      setFiltersLoaded(true);
    }
  }, []);

  // Save only after loading is finished
  useEffect(() => {
    if (!filtersLoaded) return;

    try {
      localStorage.setItem(
        FILTER_STORAGE_KEY,
        JSON.stringify(filters)
      );
    } catch (error) {
      console.error("Could not save filters to localStorage:", error);
    }
  }, [filters, filtersLoaded]);

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