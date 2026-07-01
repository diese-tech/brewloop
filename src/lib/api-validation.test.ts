import { describe, expect, it } from "vitest";
import { z } from "zod";

import { parseOrRespond } from "@/lib/api-validation";

const schema = z.object({
  priceCents: z.number().int().min(0),
});

describe("parseOrRespond", () => {
  it("returns parsed data for a valid payload", () => {
    const result = parseOrRespond(schema, { priceCents: 500 });
    expect(result.response).toBeUndefined();
    expect(result.data).toEqual({ priceCents: 500 });
  });

  it("returns a 400 JSON response instead of throwing for an invalid payload", async () => {
    const result = parseOrRespond(schema, { priceCents: -5 });
    expect(result.data).toBeUndefined();
    expect(result.response).toBeDefined();
    expect(result.response?.status).toBe(400);
    const body = await result.response?.json();
    expect(body.error).toBeTruthy();
  });
});
