import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // The registration form accepts images up to 3 MB.
      bodySizeLimit: "4mb",
    },
  },
};

export default nextConfig;
