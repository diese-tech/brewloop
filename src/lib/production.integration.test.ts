import { describe, expect, it } from "vitest";

describe.skipIf(process.env.RUN_INTEGRATION_TESTS !== "true")(
  "credential-gated production integration",
  () => {
    it("can read the seeded Black Rabbit cafe", async () => {
      const { getSupabaseAdmin } = await import("@/lib/supabase/admin");
      const { data, error } = await getSupabaseAdmin()
        .from("cafes")
        .select("slug")
        .eq("slug", "black-rabbit")
        .single();
      expect(error).toBeNull();
      expect(data?.slug).toBe("black-rabbit");
    });
  },
);
