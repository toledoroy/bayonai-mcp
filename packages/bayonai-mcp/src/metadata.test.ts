import { describe, expect, it } from "vitest";
import {
  createMcpWwwAuthenticateHeader,
  getOAuthAuthorizationServerMetadata,
  getOAuthProtectedResourceMetadata,
} from "./metadata";

describe("@bayonai/mcp metadata helpers", () => {
  it("builds protected-resource metadata for any app MCP endpoint", () => {
    expect(
      getOAuthProtectedResourceMetadata({
        documentationUrl: "https://example.com/docs/mcp",
        scopes: ["bounded.read", "bounded.write"],
        serviceUrl: "https://bounded.example/api/",
      }),
    ).toMatchObject({
      authorization_servers: ["https://bounded.example/api"],
      bearer_methods_supported: ["header"],
      resource: "https://bounded.example/api/mcp",
      resource_documentation: "https://example.com/docs/mcp",
      scopes_supported: ["bounded.read", "bounded.write"],
    });
  });

  it("requires app-specific scopes instead of using product defaults", () => {
    expect(() =>
      getOAuthProtectedResourceMetadata({
        scopes: [],
        serviceUrl: "https://bounded.example/api",
      }),
    ).toThrow("at least one scope");
  });

  it("validates URLs, resource paths, and header values", () => {
    expect(() =>
      getOAuthProtectedResourceMetadata({
        resourcePath: "mcp",
        scopes: ["bounded.read"],
        serviceUrl: "https://bounded.example/api",
      }),
    ).toThrow("resourcePath");

    expect(() =>
      getOAuthAuthorizationServerMetadata({
        scopes: ["bounded.read"],
        serviceUrl: "http://bounded.example/api",
      }),
    ).toThrow("https");

    expect(() =>
      createMcpWwwAuthenticateHeader({
        metadataUrl:
          "https://bounded.example/api/.well-known/oauth-protected-resource",
        realm: "Bounded\nMCP",
        scopes: ["bounded.read"],
      }),
    ).toThrow("control characters");
  });

  it("builds OAuth authorization-server metadata", () => {
    expect(
      getOAuthAuthorizationServerMetadata({
        scopes: ["bounded.read"],
        serviceUrl: "https://bounded.example/api",
      }),
    ).toMatchObject({
      authorization_endpoint: "https://bounded.example/api/oauth/authorize",
      code_challenge_methods_supported: ["S256"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      issuer: "https://bounded.example/api",
      registration_endpoint: "https://bounded.example/api/oauth/register",
      token_endpoint: "https://bounded.example/api/oauth/token",
    });
  });

  it("builds an MCP bearer challenge with metadata", () => {
    expect(
      createMcpWwwAuthenticateHeader({
        metadataUrl:
          "https://bounded.example/api/.well-known/oauth-protected-resource",
        realm: "Bounded MCP",
        scopes: ["bounded.read", "bounded.write"],
      }),
    ).toBe(
      'Bearer realm="Bounded MCP", resource_metadata="https://bounded.example/api/.well-known/oauth-protected-resource", scope="bounded.read bounded.write"',
    );
  });
});
