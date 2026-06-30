import { z } from "zod";

const productionSchema = z.object({
  APP_URL: z.string().url(),
  QR_SIGNING_SECRET: z.string().min(32),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_SQUARE_APPLICATION_ID: z.string().min(1),
  NEXT_PUBLIC_SQUARE_LOCATION_ID: z.string().default(""),
  SQUARE_ACCESS_TOKEN: z.string().min(1),
  SQUARE_WEBHOOK_SIGNATURE_KEY: z.string().min(1),
  SQUARE_ENVIRONMENT: z.enum(["sandbox", "production"]).default("sandbox"),
});

export function isDemoMode() {
  return process.env.BREWLOOP_DEMO_MODE === "true";
}

export function getProductionConfig() {
  if (isDemoMode()) {
    throw new Error("Production configuration is unavailable in demo mode.");
  }
  const result = productionSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `Missing production configuration: ${result.error.issues
        .map((issue) => issue.path.join("."))
        .join(", ")}`,
    );
  }
  return result.data;
}
