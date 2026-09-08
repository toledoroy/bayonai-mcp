# Authorization consent integration profile

This profile preserves the user-experience and security decisions Bayon
applications must follow when they expose an OAuth authorization endpoint for
an MCP server. It complements the pure helpers in `@bayonai/mcp`; it does not
move login, consent rendering, or business authorization into the package.

## Session-aware flow

The authorization page must resolve the host application's browser session
before choosing what to render.

### Signed-in user

- Show the requested permissions and one primary **Approve** action.
- Do not show a login-provider action when the current application session is
  already authenticated.
- Identify the signed-in account and provide a secondary **Change account**
  action.
- When a requested write scope requires an explicit consent control, render the
  checkbox selected initially. The user must still submit **Approve**, and the
  server must reject the write grant if the submitted approval is absent.

### Signed-out user

- Send the user through the host application's canonical login flow instead of
  embedding a provider-specific login in the consent page.
- After successful authentication, return to the authorization endpoint and
  resume the same request.
- Preserve `client_id`, `redirect_uri`, `response_type`, `scope`, `state`,
  `resource`, the PKCE challenge, and the PKCE challenge method exactly across
  the login round trip.

### Change account

- End or replace the current browser session, then enter the same canonical
  login-and-return flow used for a signed-out user.
- Preserve the original authorization request while switching accounts.
- Do not treat account switching itself as consent.

## Consent presentation

- Use the host application's normal login/authentication layout, typography,
  spacing, colors, focus treatment, and responsive behavior.
- Show a registered client name and the registered redirect host in readable
  form. Do not let request parameters override registered client identity.
- Describe permissions in human language. Keep raw OAuth values in the request
  payload rather than presenting technical identifiers as the primary content.
- Place each checkbox inline with its semantic label. A checkbox must retain
  checkbox-sized geometry and must not inherit full-width text-input styling.
- Keep the primary approval action visually distinct from the secondary
  account-switching action.

The exact copy, theme tokens, identity provider, session API, and scope names
belong to the host application.

## Security invariants

- Validate the registered client, exact redirect URI, response type, resource,
  requested scopes, and PKCE parameters before rendering consent and again
  before issuing an authorization code.
- Accept a login return target only when it is a same-origin authorization path
  owned by the host application. An absent or unsafe target must fall back to a
  safe application route.
- Render only server-normalized scopes. Unsupported scopes must fail rather
  than silently broadening or changing the grant.
- A selected checkbox is presentation state, not authorization. The server must
  verify the submitted consent and enforce the resulting scopes on every tool.
- Preserve OAuth `state` unchanged. Never log authorization codes, access
  tokens, refresh tokens, PKCE verifiers, session tokens, or private tool data.
- Consent responses should be non-cacheable and non-frameable and should use a
  restrictive content security policy suitable for the host application.

## Ownership boundary

`@bayonai/mcp` documents this profile so the behavior survives package releases.
Host applications remain responsible for implementing and testing it because
the package intentionally has no dependency on Firebase Auth, another identity
provider, a web framework, or a design system.

