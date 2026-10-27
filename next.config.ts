import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["192.168.0.220"],
  // Renamed products keep their old addresses working (and their search ranking).
  redirects() {
    return [
      { source: "/products/bytescon", destination: "/products/bytesgov", permanent: true },
      { source: "/products/e-invoicing", destination: "/products/bytesbilling", permanent: true },
      { source: "/products/molarline-ai", destination: "/products/bytesagentic", permanent: true },
    ];
  },
};

export default nextConfig;
