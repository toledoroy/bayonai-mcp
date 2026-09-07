import { createHash, timingSafeEqual } from "crypto";

export function buildPkceChallenge(verifier: string) {
  return createHash("sha256").update(verifier).digest("base64url");
}

export function verifyPkceChallenge({
  challenge,
  method,
  verifier,
}: {
  challenge: string;
  method: string;
  verifier: string;
}) {
  if (method !== "S256") {
    return false;
  }

  const expectedChallenge = buildPkceChallenge(verifier);
  const expected = Buffer.from(expectedChallenge);
  const actual = Buffer.from(challenge);

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
