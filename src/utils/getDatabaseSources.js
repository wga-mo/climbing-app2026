//used in CragDetailsClient.js and CragMapClient.js 

export function getDatabaseSources(isLoggedIn) {
  return {
    crags: isLoggedIn ? "crags" : "public_crag_preview",
    sectors: isLoggedIn ? "sectors" : "public_sector_preview",
    routes: isLoggedIn ? "routes" : "public_route_preview",
    locations: isLoggedIn ? "locations" : "public_location_preview",
    paths: "map_paths",
  };
}