/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/topo/[topoFolderId]/[sectorId]": [
      "./src/assets/fonts/NotoSans-Regular.ttf",
    ],
  },
};

export default nextConfig;