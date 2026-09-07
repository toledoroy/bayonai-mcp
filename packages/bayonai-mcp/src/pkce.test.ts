import { describe, expect, it } from "vitest";
import { buildPkceChallenge, verifyPkceChallenge } from "./pkce";

describe("@bayonai/mcp PKCE helpers", () => {
  it("verifies S256 challenges", () => {
    const verifier = "a".repeat(64);

    expect(
      verifyPkceChallenge({
        challenge: buildPkceChallenge(verifier),
        method: "S256",
        verifier,
      }),
    ).toBe(true);
  });

  it("rejects mismatched or unsupported challenges", () => {
    const verifier = "b".repeat(64);

    expect(
      verifyPkceChallenge({
        challenge: buildPkceChallenge(verifier),
        method: "S256",
        verifier: "c".repeat(64),
      }),
    ).toBe(false);
    expect(
      verifyPkceChallenge({
        challenge: buildPkceChallenge(verifier),
        method: "plain",
        verifier,
      }),
    ).toBe(false);
  });
});
