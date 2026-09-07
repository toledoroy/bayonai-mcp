export const MCP_LATEST_PROTOCOL_VERSION = "2026-07-28" as const;
export const MCP_LEGACY_PROTOCOL_VERSION = "2025-06-18" as const;
export const MCP_MODERN_PROTOCOL_VERSIONS = [
  MCP_LATEST_PROTOCOL_VERSION,
] as const;
export const MCP_SUPPORTED_PROTOCOL_VERSIONS = [
  MCP_LATEST_PROTOCOL_VERSION,
  MCP_LEGACY_PROTOCOL_VERSION,
] as const;
export const MCP_DEFAULT_DISCOVERY_TTL_MS = 3_600_000;

export type McpServerInfo = {
  name: string;
  title?: string;
  version: string;
};

export type McpServerCapabilities = Record<string, unknown>;

export type McpToolAnnotations = {
  destructiveHint: boolean;
  idempotentHint: boolean;
  openWorldHint: boolean;
  readOnlyHint: boolean;
};

export const MCP_READ_ONLY_CLOSED_WORLD_TOOL_ANNOTATIONS = Object.freeze({
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
  readOnlyHint: true,
}) satisfies Readonly<McpToolAnnotations>;

export const MCP_DESTRUCTIVE_CLOSED_WORLD_TOOL_ANNOTATIONS = Object.freeze({
  destructiveHint: true,
  idempotentHint: false,
  openWorldHint: false,
  readOnlyHint: false,
}) satisfies Readonly<McpToolAnnotations>;

type CompleteResultOptions<TFields extends object> = {
  fields?: TFields;
  serverInfo: McpServerInfo;
};

export function createMcpCompleteResult<
  TFields extends object = Record<string, never>,
>({ fields, serverInfo }: CompleteResultOptions<TFields>) {
  // Protocol-owned fields are written last so callers cannot accidentally
  // replace the completion marker or server identity through their payload.
  return {
    ...(fields ?? ({} as TFields)),
    _meta: {
      "io.modelcontextprotocol/serverInfo": { ...serverInfo },
    },
    resultType: "complete" as const,
  };
}

export function createMcpServerDiscovery({
  capabilities,
  instructions,
  serverInfo,
  // Modern discovery describes modern revisions; legacy clients negotiate
  // through initialize using the combined server-configuration version list.
  supportedVersions = MCP_MODERN_PROTOCOL_VERSIONS,
  ttlMs = MCP_DEFAULT_DISCOVERY_TTL_MS,
}: {
  capabilities: McpServerCapabilities;
  instructions?: string;
  serverInfo: McpServerInfo;
  supportedVersions?: readonly string[];
  ttlMs?: number;
}) {
  if (!Number.isSafeInteger(ttlMs) || ttlMs < 0) {
    throw new Error("MCP discovery ttlMs must be a non-negative integer.");
  }

  if (supportedVersions.length === 0) {
    throw new Error("MCP discovery must advertise a protocol version.");
  }

  return createMcpCompleteResult({
    fields: {
      cacheScope: "public" as const,
      capabilities: { ...capabilities },
      ...(instructions ? { instructions } : {}),
      supportedVersions: [...new Set(supportedVersions)],
      ttlMs,
    },
    serverInfo,
  });
}
