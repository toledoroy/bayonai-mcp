import { describe, expect, it } from "vitest";
import {
  MCP_DESTRUCTIVE_CLOSED_WORLD_TOOL_ANNOTATIONS,
  MCP_READ_ONLY_CLOSED_WORLD_TOOL_ANNOTATIONS,
  createMcpCompleteResult,
  createMcpServerDiscovery,
} from "./protocol";

const serverInfo = {
  name: "bounded",
  title: "Bounded",
  version: "0.1.0",
};

describe("MCP protocol helpers", () => {
  it("builds current stateless discovery without legacy-only revisions", () => {
    expect(
      createMcpServerDiscovery({
        capabilities: { tools: { listChanged: false } },
        instructions: "Use authenticated workspace tools.",
        serverInfo,
      }),
    ).toEqual({
      _meta: {
        "io.modelcontextprotocol/serverInfo": serverInfo,
      },
      cacheScope: "public",
      capabilities: { tools: { listChanged: false } },
      instructions: "Use authenticated workspace tools.",
      resultType: "complete",
      supportedVersions: ["2026-07-28"],
      ttlMs: 3_600_000,
    });
  });

  it("protects protocol-owned complete-result fields", () => {
    expect(
      createMcpCompleteResult({
        fields: {
          _meta: { untrusted: true },
          resultType: "input_required",
          tools: [],
        },
        serverInfo,
      }),
    ).toMatchObject({
      _meta: {
        "io.modelcontextprotocol/serverInfo": serverInfo,
      },
      resultType: "complete",
      tools: [],
    });
  });

  it("rejects invalid discovery cache and version contracts", () => {
    expect(() =>
      createMcpServerDiscovery({
        capabilities: {},
        serverInfo,
        ttlMs: -1,
      }),
    ).toThrow("MCP discovery ttlMs must be a non-negative integer.");
    expect(() =>
      createMcpServerDiscovery({
        capabilities: {},
        serverInfo,
        supportedVersions: [],
      }),
    ).toThrow("MCP discovery must advertise a protocol version.");
  });

  it("exports immutable closed-world safety presets", () => {
    expect(MCP_READ_ONLY_CLOSED_WORLD_TOOL_ANNOTATIONS).toEqual({
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
      readOnlyHint: true,
    });
    expect(MCP_DESTRUCTIVE_CLOSED_WORLD_TOOL_ANNOTATIONS).toEqual({
      destructiveHint: true,
      idempotentHint: false,
      openWorldHint: false,
      readOnlyHint: false,
    });
    expect(Object.isFrozen(MCP_READ_ONLY_CLOSED_WORLD_TOOL_ANNOTATIONS)).toBe(
      true,
    );
  });
});
