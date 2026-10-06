import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Batas upload foto mobil & dokumen (FR-19)
      bodySizeLimit: "8mb",
    },
  },
  poweredByHeader: false,
};

export default nextConfig;
