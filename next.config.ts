import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docs are read from disk at render time; make sure they ship with the route.
  outputFileTracingIncludes: {
    "/docs/**/*": ["./content/docs/**/*"],
  },
};

export default nextConfig;
