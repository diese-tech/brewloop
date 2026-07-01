import { afterEach, describe, expect, it, vi } from "vitest";

import { getProductionReadiness } from "@/lib/config";

describe("getProductionReadiness", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("never throws and reports missing configuration as false", () => {
    vi.stubEnv("APP_URL", "");
    vi.stubEnv("QR_SIGNING_SECRET", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    vi.stubEnv("NEXT_PUBLIC_SQUARE_APPLICATION_ID", "");
    vi.stubEnv("NEXT_PUBLIC_SQUARE_LOCATION_ID", "");
    vi.stubEnv("SQUARE_ACCESS_TOKEN", "");
    vi.stubEnv("SQUARE_WEBHOOK_SIGNATURE_KEY", "");

    const readiness = getProductionReadiness();

    expect(readiness.appUrl).toBe(false);
    expect(readiness.qrSigningSecret).toBe(false);
    expect(readiness.supabase).toEqual({
      url: false,
      anonKey: false,
      serviceRoleKey: false,
    });
    expect(readiness.square.applicationId).toBe(false);
    expect(readiness.square.environment).toBe("sandbox");
  });

  it("reports configured values as true without exposing them", () => {
    vi.stubEnv("APP_URL", "https://example.com");
    vi.stubEnv("QR_SIGNING_SECRET", "x".repeat(32));
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "anon");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "service");
    vi.stubEnv("NEXT_PUBLIC_SQUARE_APPLICATION_ID", "app");
    vi.stubEnv("SQUARE_ACCESS_TOKEN", "token");
    vi.stubEnv("SQUARE_WEBHOOK_SIGNATURE_KEY", "webhook");
    vi.stubEnv("SQUARE_ENVIRONMENT", "production");

    const readiness = getProductionReadiness();

    expect(readiness.appUrl).toBe(true);
    expect(readiness.qrSigningSecret).toBe(true);
    expect(readiness.supabase.url).toBe(true);
    expect(readiness.square.accessToken).toBe(true);
    expect(readiness.square.environment).toBe("production");
    expect(JSON.stringify(readiness)).not.toContain("x".repeat(32));
    expect(JSON.stringify(readiness)).not.toContain("token");
  });

  it("rejects a QR signing secret shorter than 32 characters", () => {
    vi.stubEnv("QR_SIGNING_SECRET", "too-short");
    expect(getProductionReadiness().qrSigningSecret).toBe(false);
  });
});
