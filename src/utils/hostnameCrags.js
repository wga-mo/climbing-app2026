export function hostnameCrags() {
  const hostname = window.location.hostname;

  const SITE_CONFIG = {
    localhost: {
      regions: null, // null = all regions
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