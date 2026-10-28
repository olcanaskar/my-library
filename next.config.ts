import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Capacitor / statik barındırma için: sunucu tarafı yok.
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
