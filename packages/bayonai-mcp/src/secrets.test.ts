import { describe, expect, it } from "vitest";
import {
  constantTimeEqual,
  createMcpRandomToken,
  hashMcpSecret,
} from "./secrets";

describe("@bayonai/mcp secret helpers", () => {
  it("generates URL-safe tokens and stable hashes", () => {
    const token = createMcpRandomToken(32);

    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(hashMcpSecret("secret")).toBe(hashMcpSecret("secret"));
    expect(hashMcpSecret("secret")).not.toBe(hashMcpSecret("other"));
  });

  it("compares strings without leaking equality via normal comparison", () => {
    expect(constantTimeEqual("same", "same")).toBe(true);
    expect(constantTimeEqual("same", "diff")).toBe(false);
    expect(constantTimeEqual("same", "longer")).toBe(false);
  });
});
