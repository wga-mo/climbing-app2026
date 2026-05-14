export function doesRouteMatchFilters(route, filters) {
  const styleMatch =
    (filters.sport && route.style === "sport") ||
    (filters.trad &&
      ["trad", "mix"].includes(route.style)) ||
    (filters.boulder &&
      route.style === "boulder");

  const pitchMatch =
    (filters.p_s && route.pitches === 1) ||
    (filters.p_m && route.pitches > 1);

  const gradeMatch =
    route.grade_int >= filters.gradeMin &&
    route.grade_int <= filters.gradeMax;

  return (
    styleMatch &&
    pitchMatch &&
    gradeMatch
  );
}