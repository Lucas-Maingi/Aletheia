import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://gumroad.com https://*.gumroad.com https://va.vercel-scripts.com; frame-src 'self' https://gumroad.com https://*.gumroad.com https://gum.co https://*.gum.co; connect-src 'self' https://ojdqtdkrwadjuznfqswk.supabase.co https://gumroad.com https://*.gumroad.com; img-src 'self' data: https://*.supabase.co https://gumroad.com https://*.gumroad.com https://transparenttextures.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://assets.gumroad.com https://*.gumroad.com; font-src 'self' https://fonts.gstatic.com https://assets.gumroad.com https://*.gumroad.com;",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
