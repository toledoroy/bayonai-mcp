# @bayonai/mcp release source

This repository contains only the shared MCP package and its release tooling.
Application code, credentials, and deployment configuration are not included.

See [package documentation](packages/bayonai-mcp/README.md). The existing
UNLICENSED package designation is preserved; this change grants no new license.

Publishing is manual and main-only. Configure the npm trusted publisher for
repository `toledoroy/bayonai-mcp`, workflow `publish.yml`, then dispatch the
workflow with the package version. The workflow builds, tests, verifies an
isolated packed consumer, publishes with provenance, and checks registry integrity.
