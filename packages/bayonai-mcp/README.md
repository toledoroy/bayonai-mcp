# @bayonai/mcp

Shared MCP OAuth and protocol helpers for Bayon apps.

This package contains app-agnostic helpers for remote MCP servers:

- OAuth protected-resource and authorization-server metadata.
- `WWW-Authenticate` bearer challenges that point MCP clients to metadata.
- PKCE S256 challenge creation and verification.
- Secret hashing, random token generation, and constant-time comparisons.
- MCP `2026-07-28` stateless discovery and complete-result builders with
  `2025-06-18` compatibility.
- Standard read-only and destructive closed-world tool annotations.

Application code remains responsible for its own MCP tools/resources/prompts,
business authorization, persistence, audit logging, and user-consent UI.

Bayon applications should follow the published
[authorization consent integration profile](docs/authorization-consent.md) for
session reuse, canonical login, account switching, consent controls, host-app
visual consistency, and authorization-request safety.

## Install

```sh
pnpm add @bayonai/mcp
```

## Metadata

```ts
import {
  createMcpWwwAuthenticateHeader,
  getOAuthAuthorizationServerMetadata,
  getOAuthProtectedResourceMetadata,
} from "@bayonai/mcp";

const baseUrl = "https://bounded.example/api";
const scopes = ["bounded.read", "bounded.write"];

export const protectedResource = getOAuthProtectedResourceMetadata({
  documentationUrl: "https://bounded.example/docs/mcp",
  scopes,
  serviceUrl: baseUrl,
});

export const authorizationServer = getOAuthAuthorizationServerMetadata({
  scopes,
  serviceUrl: baseUrl,
});

export const wwwAuthenticate = createMcpWwwAuthenticateHeader({
  metadataUrl: `${baseUrl}/.well-known/oauth-protected-resource`,
  realm: "Bounded MCP",
  scopes,
});
```

## PKCE

```ts
import { buildPkceChallenge, verifyPkceChallenge } from "@bayonai/mcp";

const challenge = buildPkceChallenge(codeVerifier);

if (!verifyPkceChallenge({ challenge, method: "S256", verifier })) {
  throw new Error("Invalid PKCE verifier.");
}
```

## Token Secrets

```ts
import { createMcpRandomToken, hashMcpSecret } from "@bayonai/mcp";

const accessToken = `app_mcp_access_${createMcpRandomToken(40)}`;
const accessTokenHash = hashMcpSecret(accessToken);
```

Store token hashes, not bearer tokens. The app owns expiry, revocation, refresh
rotation, and user/session lookup.

## Protocol Results

```ts
import {
  MCP_READ_ONLY_CLOSED_WORLD_TOOL_ANNOTATIONS,
  createMcpCompleteResult,
  createMcpServerDiscovery,
} from "@bayonai/mcp";

const serverInfo = { name: "bounded", title: "Bounded", version: "0.1.0" };

const discovery = createMcpServerDiscovery({
  capabilities: { tools: { listChanged: false } },
  instructions: "Use authenticated workspace tools.",
  serverInfo,
});

const tools = createMcpCompleteResult({
  fields: { tools: toolDefinitions },
  serverInfo,
});

const listTool = {
  annotations: { ...MCP_READ_ONLY_CLOSED_WORLD_TOOL_ANNOTATIONS },
  // App-specific name, description, schema, and implementation stay local.
};
```

## Package Boundaries

Keep these app-specific concerns outside `@bayonai/mcp`:

- Tool/resource/prompt registries.
- Firestore collection names and indexes.
- Firebase Auth, service-token, or admin consent flows.
- Product-specific scopes such as `thunderlist.read` or `bounded.write`.
- Audit logging and mutation authorization.

The package documents the shared consent experience, but applications own its
implementation and enforce consent server-side.

## Release Checks

```sh
corepack pnpm --dir packages/bayonai-mcp run lint
corepack pnpm --dir packages/bayonai-mcp run build
corepack pnpm exec vitest run packages/bayonai-mcp/src/metadata.test.ts packages/bayonai-mcp/src/pkce.test.ts packages/bayonai-mcp/src/secrets.test.ts
corepack pnpm --dir packages/bayonai-mcp run smoke:pack
```

Modern discovery advertises `MCP_MODERN_PROTOCOL_VERSIONS`. The combined
`MCP_SUPPORTED_PROTOCOL_VERSIONS` configures servers that also support legacy
initialization. HTTP validation and wire encoding belong to the official MCP
SDK adapter in each application; these pure helpers do not implement transport.
