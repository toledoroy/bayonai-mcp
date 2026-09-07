import { createHash, randomBytes, timingSafeEqual } from "crypto";

export function createMcpRandomToken(bytes: number) {
  return randomBytes(bytes).toString("base64url");
}

export function hashMcpSecret(secret: string) {
  return createHash("sha256").update(secret).digest("base64url");
}

export function constantTimeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}
