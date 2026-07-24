# Authentication (mobile)

> This document covers the **mobile app**: how it stores tokens, drives the auth
> lifecycle, and talks to the auth endpoints. For the token protocol itself
> (PASETO access tokens, opaque rotating refresh tokens, verification, and
> revocation) see the backend reference:
> [`backend/pinit_api/doc/authentication.md`](../../backend/pinit_api/doc/authentication.md).
> The web app uses a different delivery mechanism (httpOnly cookies) — see
> [`web/doc/authentication.md`](../../web/doc/authentication.md).

## Overview

The app authenticates against the backend's **mobile** auth endpoints. Unlike
the web app, mobile has **no httpOnly cookies** — both tokens travel in the JSON
body and are stored on the device.

| Endpoint | Purpose |
|---|---|
| `POST /token/mobile/` | Log in — returns access + refresh token in the body. |
| `POST /token/mobile/refresh/` | Refresh — send the refresh token, get a new access token **and a rotated refresh token** back. |
| `POST /token/mobile/logout/` | Log out — send the refresh token so the backend revokes it. |

The mobile app is **login-only** — it has no signup flow (unlike the web app).

**Where tokens live** ([`src/lib/utils/authentication.ts`](../src/lib/utils/authentication.ts)):

| Store | Holds |
|---|---|
| `expo-secure-store` | the access token and the refresh token |
| `AsyncStorage` | the access token's expiry date, and a cached profile-picture URL |

**Auth state** is a small reducer in
[`src/contexts/authenticationContext.tsx`](../src/contexts/authenticationContext.tsx)
tracking `isCheckingAccessToken` and `isAuthenticated`, driven by the actions
`FOUND_ACCESS_TOKEN`, `CHECKED_NO_ACCESS_TOKEN`, `LOGGED_IN`, `LOGGED_OUT`, and
`GOT_401_RESPONSE`.

## Flows

### 1. App launch (the gate)

[`NavigationContainer`](../src/components/NavigationContainer/NavigationContainer.tsx)
decides which navigator to render. It reads the access token from secure store
and, if present, refreshes it **before** entering the authenticated tree — so
authenticated screens never fire a request with a stale token and get bounced by
a spurious 401.

1. `NavigationContainer` reads the access token from secure store.
2. **No token** → dispatch `CHECKED_NO_ACCESS_TOKEN` → render the login tree.
3. **Token present** → call `ensureFreshAccessToken()` (refreshes if the stored
   expiry is missing or within 2 minutes of expiring):
   - **Session usable** (refreshed, or still fresh) → dispatch
     `FOUND_ACCESS_TOKEN` → render the authenticated tree.
   - **Cannot refresh** → `clearStoredAuthData()`, then dispatch
     `CHECKED_NO_ACCESS_TOKEN` → render the login tree.

While `isCheckingAccessToken` is true the container renders nothing (no UI
flash). The proactive refresh window is `TOKEN_REFRESH_BUFFER_BEFORE_EXPIRATION_MS`
(2 minutes), well below the 15-minute access-token lifetime.

### 2. Login

[`LoginScreenContainer`](../src/navigators/UnauthenticatedNavigator/LoginScreenContainer.tsx)
POSTs credentials to `token/mobile/`, persists the returned tokens and expiry
date via `persistTokensData`, and dispatches `LOGGED_IN`.

### 3. Authenticated requests (reactive refresh)

`fetchWithAuthentication` ([`src/lib/utils/fetch.ts`](../src/lib/utils/fetch.ts))
attaches `Authorization: Bearer <access token>` from secure store. The launch
gate refreshes proactively, but if a request still returns **401** (clock skew,
a token invalidated server-side), it transparently calls `refreshAccessToken()`
once, persists the new tokens (**access token plus the rotated refresh token**),
and retries. The caller only sees the 401 if the refresh itself fails. This
mirrors the web app's `useFetchWithAuth`.

### 4. 401 handling

A 401 reaches the caller only when the reactive refresh above **also** failed —
i.e. the session is genuinely dead. The consumer
([`useMyAccountDetails`](../src/hooks/useMyAccountDetails.ts),
[`PinsBoardContainer`](../src/components/PinsBoard/PinsBoardContainer.tsx))
clears **all** stored auth data via `clearStoredAuthData()` and dispatches
`GOT_401_RESPONSE`, returning to login. Clearing the tokens matters — otherwise
a dead token would bounce the user in and out of the app on the next launch.

### 5. Logout

[`ProfileScreen`](../src/navigators/BrowseMainNavigator/ProfileScreen.tsx) calls
`logOut()` and dispatches `LOGGED_OUT`. `logOut()` first POSTs the refresh token
to `token/mobile/logout/` so the backend **revokes it server-side** — giving
mobile the same revocation guarantee as web — then clears all stored auth data.

> **Best-effort revocation.** The server-side revoke call must never block
> logout: if it fails (offline, token already expired), `logOut()` still clears
> the local tokens so the user is never stuck logged in. The refresh token would
> then simply expire on its own.

## Refresh, proactively and reactively

Both paths converge on `refreshAccessToken`
([`src/lib/utils/authentication.ts`](../src/lib/utils/authentication.ts)), which
reads the stored refresh token, POSTs it to `token/mobile/refresh/`, and persists
the new access token **and the rotated refresh token** from the response.
Persisting the rotated refresh token is essential: the presented one is revoked
server-side, so the next refresh must use the new value.

`refreshAccessToken` is **single-flight**: if a refresh is already running,
concurrent callers (e.g. several requests hitting 401 at once) await that same
request rather than each starting their own. Because refresh tokens rotate,
parallel refreshes would otherwise spend the same token twice and revoke one
another, ending the session.

| Helper | Role |
|---|---|
| `ensureFreshAccessToken()` | Refresh only if the stored expiry is missing or within the 2-minute buffer. Used by the launch gate. |
| `refreshAccessToken()` | Unconditionally refresh from the stored refresh token. Used by the reactive 401 path. |
| `persistTokensData()` | Write access token / refresh token / expiry to their stores. |
| `logOut()` | Revoke the refresh token server-side (best-effort), then `clearStoredAuthData()`. |
| `clearStoredAuthData()` | Remove all persisted session data (logout, dead session). |

## Key files

| File | Role |
|---|---|
| [`src/components/NavigationContainer/NavigationContainer.tsx`](../src/components/NavigationContainer/NavigationContainer.tsx) | Launch gate — chooses authenticated vs. unauthenticated navigator. |
| [`src/contexts/authenticationContext.tsx`](../src/contexts/authenticationContext.tsx) | Auth-state reducer (`isCheckingAccessToken`, `isAuthenticated`). |
| [`src/lib/utils/authentication.ts`](../src/lib/utils/authentication.ts) | Token storage + proactive/reactive refresh helpers. |
| [`src/lib/utils/fetch.ts`](../src/lib/utils/fetch.ts) | `fetchWithAuthentication` — Bearer header + reactive refresh/retry. |
| [`src/navigators/UnauthenticatedNavigator/LoginScreenContainer.tsx`](../src/navigators/UnauthenticatedNavigator/LoginScreenContainer.tsx) | Login. |
| [`src/lib/constants.ts`](../src/lib/constants.ts) | API endpoints and storage keys. |
