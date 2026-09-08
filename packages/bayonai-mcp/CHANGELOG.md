# Changelog

## 1.0.14 - 2026-09-08

- Added the Bayon authorization-consent integration profile covering existing
  sessions, canonical application login, account switching, write-consent
  controls, host design-system reuse, and OAuth return-flow safety.

## 1.0.13 - Release candidate

- Added MCP `2026-07-28` stateless discovery and complete-result helpers while
  retaining the `2025-06-18` compatibility version for initialization. Modern
  discovery defaults to modern revisions only.
- Added immutable read-only and destructive closed-world tool annotation
  presets.

## 0.1.0 - 2026-07-06

- Added OAuth protected-resource metadata helpers.
- Added OAuth authorization-server metadata helpers.
- Added MCP bearer `WWW-Authenticate` challenge helper.
- Added PKCE S256 challenge creation and verification.
- Added URL-safe token generation, SHA-256 secret hashing, and constant-time
  comparison helpers.
- Added dual CJS/ESM package output and packed-package smoke verification.
