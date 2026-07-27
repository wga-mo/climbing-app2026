export function hostnameCrags() {
  const hostname =
    typeof window !== "undefined"
      ? window.location.hostname
      : "";

  const SITE_CONFIG = {
    localhost: {
      regions: null, // null = all regions
      //regions: ["Gol og Hemsedal", "Drammen", "Oslo"],
    },

    "climbing2026.vercel.app": {
      regions: ["Oslo"],
    },

    "klatring2026.vercel.app": {
      regions: ["Drammen"],
    },

    "klatring-gol-og-hemsedal.vercel.app": {
      regions: ["Gol og Hemsedal"],
    },
  };

  return SITE_CONFIG[hostname] ?? { regions: null };
}