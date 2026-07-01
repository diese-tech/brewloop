import { NextResponse } from "next/server";
import type { ZodType } from "zod";

export function parseOrRespond<T>(
  schema: ZodType<T>,
  body: unknown,
): { data: T; response?: undefined } | { data?: undefined; response: NextResponse } {
  const result = schema.safeParse(body);
  if (!result.success) {
    return {
      response: NextResponse.json(
        { error: result.error.issues.map((issue) => issue.message).join(" ") },
        { status: 400 },
      ),
    };
  }
  return { data: result.data };
}
