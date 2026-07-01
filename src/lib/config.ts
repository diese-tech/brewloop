import { z } from "zod";

const supabaseConfigSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

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

/**
 * Just the Supabase URL/service-role key, for callers (like
 * getSupabaseAdmin()) that only need a Supabase admin client and shouldn't
 * be blocked by unrelated missing Square/QR config. Prefer this over
 * getProductionConfig() unless Square/QR fields are actually needed too.
 */
export function getSupabaseConfig() {
  if (isDemoMode()) {
    throw new Error("Supabase configuration is unavailable in demo mode.");
  }
  const result = supabaseConfigSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(
      `Missing Supabase configuration: ${result.error.issues
        .map((issue) => issue.path.join("."))
        .join(", ")}`,
    );
  }
  return result.data;
}

/**
 * Presence-only configuration status for the admin setup hub. Never throws
 * and never returns secret values — only whether each is set, so it's safe
 * to render directly in the UI.
 */
export function getProductionReadiness() {
  const env = process.env;
  return {
    appUrl: Boolean(env.APP_URL),
    qrSigningSecret: Boolean(env.QR_SIGNING_SECRET && env.QR_SIGNING_SECRET.length >= 32),
    supabase: {
      url: Boolean(env.NEXT_PUBLIC_SUPABASE_URL),
      anonKey: Boolean(env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      serviceRoleKey: Boolean(env.SUPABASE_SERVICE_ROLE_KEY),
    },
    square: {
      applicationId: Boolean(env.NEXT_PUBLIC_SQUARE_APPLICATION_ID),
      locationId: Boolean(env.NEXT_PUBLIC_SQUARE_LOCATION_ID),
      accessToken: Boolean(env.SQUARE_ACCESS_TOKEN),
      webhookSignatureKey: Boolean(env.SQUARE_WEBHOOK_SIGNATURE_KEY),
      environment: env.SQUARE_ENVIRONMENT === "production" ? "production" : "sandbox",
    },
  };
}
