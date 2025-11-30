import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disabled cacheComponents as it's incompatible with cookies() usage in API routes
  // cacheComponents: true,
};

export default nextConfig;
