# MCP-001 — Retain the Bayon consent integration profile

Status: Completed

Difficulty: M

## Goal

Preserve the agreed OAuth consent experience in the shared package so future
Bayon MCP integrations do not have to rediscover it, while keeping identity,
rendering, and authorization enforcement in the host application.

## Scope

- Add a published integration profile for signed-in, signed-out, and
  change-account flows.
- Record the consent-control and host-design-system decisions.
- Record the OAuth and redirect safety invariants that host applications must
  preserve.
- Link the profile from the package README and verify it is present in the
  packed npm artifact.

## Product and technical decisions

- The profile is normative for Bayon applications using `@bayonai/mcp`, but the
  package does not render consent UI or depend on an identity provider.
- An existing application session is reused. A signed-in user sees consent and
  account-switching controls, not a duplicate login choice.
- A signed-out user authenticates through the host application's canonical
  login flow and then resumes the original authorization request.
- Requested write consent is initially selected, but the user must still submit
  the approval action and the server must validate that approval.
- Consent UI uses the host application's design system. Checkbox controls keep
  native checkbox geometry and remain aligned with their label instead of
  inheriting full-width text-input styles.
- No database, schema, OAuth wire-format, or package runtime API change is
  required.

## Verification

- Package lint and tests pass.
- The packed-package smoke check confirms the integration profile is included.
- Release `@bayonai/mcp@1.0.14` through the main-only provenance workflow and
  verify the public registry artifact.

## Release evidence

- `@bayonai/mcp@1.0.14` was published with npm provenance on 2026-09-08.
- Package lint, 13 tests, build, local pack, and packed-consumer smoke passed in
  both the local release checkout and GitHub Actions.
- npm returned the published version and integrity, and a registry download
  contained the expected 31 files, including `docs/authorization-consent.md`.
- The downloaded package contents exactly matched the locally verified package
  contents.
- npm propagation exceeded the verifier's previous 60-second window, so the
  default was raised to 180 seconds for future releases. The initial workflow
  run therefore reports a failed final verification step even though publication
  and subsequent registry verification succeeded.

## Related plans

- Bounded: `docs/superpowers/plans/2026-09-05-TL-F005-mcp-endpoint-audit-remediation.md`
