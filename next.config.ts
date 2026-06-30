import type { NextConfig } from "next";

if (
  process.env.BREWLOOP_DEMO_MODE === "true" &&
  (process.env.VERCEL_ENV === "production" ||
    process.env.npm_lifecycle_event === "start")
) {
  throw new Error("BREWLOOP_DEMO_MODE cannot run in production.");
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' https://sandbox.web.squarecdn.com https://web.squarecdn.com",
              "frame-src 'self' https://sandbox.web.squarecdn.com https://web.squarecdn.com",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://connect.squareupsandbox.com https://connect.squareup.com https://sandbox.web.squarecdn.com https://web.squarecdn.com https://pci-connect.squareupsandbox.com https://pci-connect.squareup.com https://o160250.ingest.sentry.io",
              "font-src 'self' https://square-fonts-production-f.squarecdn.com https://d1g145x70srn7h.cloudfront.net",
              "img-src 'self' data: https:",
              "style-src 'self' 'unsafe-inline' https://sandbox.web.squarecdn.com https://web.squarecdn.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
