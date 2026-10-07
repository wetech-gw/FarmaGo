import type { NextConfig } from "next";

const nextConfig: NextConfig = {
 output: "standalone", 
 experimental: {
    serverActions: {
      // The registration form accepts images up to 3 MB.
      bodySizeLimit: "4mb",
    },
  },
  async headers() {
    return [
      {
        // O service worker nunca pode ser servido de cache: caso contrário
        // uma versão antiga continua a controlar a página depois do deploy.
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
      {
        // O manifesto é gerado por-request e muda com o idioma do cookie.
        source: "/manifest.webmanifest",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/icons/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
