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

    //Main page
    "climbing-app2026.vercel.app": {
      regions: null, // null = all regions
    },

    //Oslo only
    "climbing2026.vercel.app": {
      regions: ["Oslo"],
    },

    //Drammen only
    "klatring2026.vercel.app": {
      regions: ["Drammen"],
    },

    //Gol and Hemsedal only
    "klatring-gol-og-hemsedal.vercel.app": {
      regions: ["Gol og Hemsedal"],
    },
  };

  return SITE_CONFIG[hostname] ?? { regions: null };
}