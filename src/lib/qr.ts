import { createHmac, timingSafeEqual } from "node:crypto";

const DEFAULT_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const CLOCK_SKEW_TOLERANCE_MS = 60_000;

function digest(slug: string, table: string, issuedAt: number, secret: string) {
  return createHmac("sha256", secret)
    .update(`${slug}:${table}:${issuedAt}`)
    .digest("base64url");
}

export function signTable(
  slug: string,
  table: string,
  secret: string,
  issuedAt: number = Date.now(),
) {
  return `${issuedAt}.${digest(slug, table, issuedAt, secret)}`;
}

export function verifyTableSignature(
  slug: string,
  table: string,
  signed: string,
  secret: string,
  options: { ttlMs?: number; now?: number } = {},
) {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const now = options.now ?? Date.now();

  const [issuedAtRaw, signature] = signed.split(".");
  if (!issuedAtRaw || !signature) return false;

  const issuedAt = Number(issuedAtRaw);
  if (!Number.isFinite(issuedAt)) return false;
  if (issuedAt - now > CLOCK_SKEW_TOLERANCE_MS) return false;
  if (now - issuedAt > ttlMs) return false;

  const expected = Buffer.from(digest(slug, table, issuedAt, secret));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
