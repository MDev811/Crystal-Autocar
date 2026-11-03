import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Batas upload foto mobil & dokumen (FR-19)
      bodySizeLimit: "8mb",
      allowedOrigins: ["*.trycloudflare.com", "localhost:3000"],
    },
  },
  // Izinkan origin domain tunnel untuk HMR WebSocket & dev mode
  allowedDevOrigins: ["*.trycloudflare.com", "localhost:3000"],
  poweredByHeader: false,
};

export default nextConfig;
