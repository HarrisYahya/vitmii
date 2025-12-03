// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Bing images
      {
        protocol: "https",
        hostname: "th.bing.com",
      },
      {
        protocol: "https",
        hostname: "*.bing.com",
      },

      // Supabase public storage
      {
        protocol: "https",
        hostname: "https://gigmjuxmlxzmgexionot.supabase.co",
      },
    ],
  },
};

export default nextConfig;
