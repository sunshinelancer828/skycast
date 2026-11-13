import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // WeatherAPI condition icons, e.g. //cdn.weatherapi.com/weather/64x64/day/113.png
    remotePatterns: [new URL("https://cdn.weatherapi.com/weather/**")],
  },
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
