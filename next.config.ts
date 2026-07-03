import type { NextConfig } from "next";

// Demo mode on a production deployment requires a second, explicit opt-in so
// the browser-storage demo (simulated payments, no persistence) can never
// reach the real domain by accident. Hosting the demo showcase there on
// purpose — e.g. while pitching the pilot before credentials exist — is
// allowed by also setting BREWLOOP_ALLOW_HOSTED_DEMO=true.
if (
  process.env.BREWLOOP_DEMO_MODE === "true" &&
  process.env.BREWLOOP_ALLOW_HOSTED_DEMO !== "true" &&
  (process.env.VERCEL_ENV === "production" ||
    process.env.npm_lifecycle_event === "start")
) {
  throw new Error(
    "BREWLOOP_DEMO_MODE cannot run in production. Set BREWLOOP_ALLOW_HOSTED_DEMO=true to intentionally host the demo showcase.",
  );
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
