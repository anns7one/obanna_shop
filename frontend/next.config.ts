import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Produces a minimal, self-contained server in .next/standalone for the
  // production Docker image, instead of shipping the full node_modules.
  output: "standalone",
};

export default nextConfig;
