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

      // Supabase public storage ✅ FIXED (no https:// here)
      {
        protocol: "https",
        hostname: "gigmjuxmlxzmgexionot.supabase.co",
      },

      // Adeeg images ✅ ADDED (your cart error fix)
      {
        protocol: "https",
        hostname: "adeeg.com",
      },
    ],
    
  },
};

export default nextConfig;
