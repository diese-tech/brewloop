import { createHmac, timingSafeEqual } from "node:crypto";

function digest(slug: string, table: string, secret: string) {
  return createHmac("sha256", secret)
    .update(`${slug}:${table}`)
    .digest("base64url");
}

export function signTable(slug: string, table: string, secret: string) {
  return digest(slug, table, secret);
}

export function verifyTableSignature(
  slug: string,
  table: string,
  signature: string,
  secret: string,
) {
  const expected = Buffer.from(digest(slug, table, secret));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}
