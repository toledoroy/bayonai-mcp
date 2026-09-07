export type McpOAuthMetadataOptions = {
  authorizationServerUrl?: string;
  documentationUrl?: string;
  resourcePath?: string;
  scopes: readonly string[];
  serviceUrl: string;
};

export function getOAuthProtectedResourceMetadata(
  options: McpOAuthMetadataOptions,
) {
  const serviceUrl = normalizeBaseUrl(assertAbsoluteUrl(options.serviceUrl));
  const authorizationServerUrl = normalizeBaseUrl(
    assertAbsoluteUrl(options.authorizationServerUrl ?? serviceUrl),
  );
  const resourcePath = assertAbsolutePath(options.resourcePath ?? "/mcp");
  const scopes = normalizeMcpScopes(options.scopes);

  return {
    authorization_servers: [authorizationServerUrl],
    bearer_methods_supported: ["header"],
    ...(options.documentationUrl
      ? { resource_documentation: options.documentationUrl }
      : {}),
    resource: `${serviceUrl}${resourcePath}`,
    scopes_supported: scopes,
  };
}

export function getOAuthAuthorizationServerMetadata(
  options: McpOAuthMetadataOptions,
) {
  const authorizationServerUrl = normalizeBaseUrl(
    assertAbsoluteUrl(options.authorizationServerUrl ?? options.serviceUrl),
  );
  const scopes = normalizeMcpScopes(options.scopes);

  return {
    authorization_endpoint: `${authorizationServerUrl}/oauth/authorize`,
    code_challenge_methods_supported: ["S256"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    issuer: authorizationServerUrl,
    registration_endpoint: `${authorizationServerUrl}/oauth/register`,
    response_types_supported: ["code"],
    scopes_supported: scopes,
    token_endpoint: `${authorizationServerUrl}/oauth/token`,
    token_endpoint_auth_methods_supported: ["none"],
  };
}

export function createMcpWwwAuthenticateHeader({
  metadataUrl,
  realm,
  scopes,
}: {
  metadataUrl: string;
  realm: string;
  scopes: readonly string[];
}) {
  const normalizedScopes = normalizeMcpScopes(scopes);

  return [
    `Bearer realm="${escapeHeaderValue(realm)}"`,
    `resource_metadata="${escapeHeaderValue(assertAbsoluteUrl(metadataUrl))}"`,
    `scope="${escapeHeaderValue(normalizedScopes.join(" "))}"`,
  ].join(", ");
}

export function normalizeMcpScopes(scopes: readonly string[]) {
  const normalizedScopes = scopes.map((scope) => scope.trim()).filter(Boolean);

  if (!normalizedScopes.length) {
    throw new Error("MCP OAuth scopes must include at least one scope.");
  }

  return [...new Set(normalizedScopes)];
}

function assertAbsoluteUrl(value: string) {
  const url = new URL(value);

  if (url.protocol !== "https:" && url.hostname !== "localhost") {
    throw new Error("MCP OAuth URLs must use https, except localhost.");
  }

  return url.toString();
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

function assertAbsolutePath(path: string) {
  if (!path.startsWith("/")) {
    throw new Error("MCP OAuth resourcePath must start with /.");
  }

  return path;
}

function escapeHeaderValue(value: string) {
  if (/[\u0000-\u001f\u007f]/u.test(value)) {
    throw new Error(
      "MCP OAuth header values cannot contain control characters.",
    );
  }

  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
