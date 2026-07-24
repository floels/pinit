# Authentication (web)

This document covers the web app's authentication flow: how it stores tokens, drives the
auth lifecycle, and talks to the auth endpoints. For the token protocol itself
(PASETO access tokens, opaque rotating refresh tokens, verification, and
revocation) see the backend reference:
[`backend/pinit_api/doc/authentication.md`](../../backend/pinit_api/doc/authentication.md).
The mobile app uses a different delivery mechanism — see
[`mobile/doc/authentication.md`](../../mobile/doc/authentication.md).

## Overview

The web frontend holds the two tokens as follows:

| Token | Where stored | Accessible to JS | Sent as |
|---|---|---|---|
| **Access token** | React context (in-memory) | Yes | `Authorization: Bearer …` header |
| **Refresh token** | httpOnly cookie (`refreshToken`) | No | sent automatically by the browser |

Keeping the access token in memory (not `localStorage`) limits XSS exposure;
keeping the refresh token in an httpOnly cookie prevents any script from reading
it. The refresh token cookie is set, rotated, and cleared entirely by the
backend — the web code never sees its value.

## Auth state

`AuthContext` ([`src/contexts/authContext.tsx`](../src/contexts/authContext.tsx))
is the single source of truth:

```
accessToken: string | null   — null until obtained via startup refresh or login
isAuthInitialized: boolean   — false until the startup refresh attempt settles
```

`isAuthInitialized` distinguishes "we haven't checked yet" from "we checked and
the user is unauthenticated". Without it, the app would briefly render as logged
out on every page load, even for authenticated users.

## Flows

**When is the access token refreshed?** At exactly two moments — there is no
proactive or timer-based refresh, and the web app does not track the token's
expiry at all:

1. **Once on app load** — the startup refresh (§1) bootstraps the in-memory
   access token from the refresh cookie.
2. **Reactively, after a 401** — when an authenticated request is rejected
   because the access token has expired (or is otherwise invalid),
   `useFetchWithAuth` refreshes once and retries it (§3).

Between those two events the access token simply sits in memory; the app only
discovers it has expired when a request comes back `401`. With the 15-minute
lifetime, that means a *lazy* refresh — at most roughly once per 15 minutes of
activity, triggered by the first request that fails. (The mobile app differs: it
also refreshes **proactively**, ~2 minutes before expiry.)

### 1. App startup

`AuthContextProvider` runs a one-shot TanStack Query
on mount that calls the refresh endpoint (the browser attaches the httpOnly
cookie automatically). `Layout` withholds the routed content until the attempt
settles, to avoid a flash of unauthenticated UI.

1. On mount, `AuthContextProvider` sets `isAuthInitialized = false` and POSTs
   `/token/web/refresh/` (the browser attaches the httpOnly cookie automatically).
2. **Refresh token valid** → `200 { access_token }` (backend re-sets the rotated
   refresh cookie); the provider calls `setAccessToken(token)` and
   `setIsAuthInitialized(true)`.
3. **No cookie / expired** → `401`; the provider calls `setIsAuthInitialized(true)`
   with `accessToken` left `null`.
4. Throughout, `Layout` gates `<Outlet />` on `isAuthInitialized` (spinner until
   the attempt settles).

Once authenticated, `Layout` uses `useAccountDetails` to fetch `/accounts/me/`
and populate `AccountContext` (and cache username / profile-picture URL in
`localStorage`).

### 2. Login / signup

`useLogin` posts credentials to the login endpoint; on success it stores the
returned access token in context. The backend sets the refresh cookie in the
same response, so no page reload is needed. Signup (`useSignup`) is identical —
the backend returns an access token and sets the refresh cookie.

1. The user submits email + password; `useLogin` POSTs `/token/web/`.
2. **Credentials valid** → `200 { access_token }` plus an httpOnly refresh
   cookie; `useLogin` calls `setAccessToken(token)` and the authenticated shell
   renders.
3. **Invalid credentials** → `401 { errors: [{ code }] }`; the form shows a
   field error.

### 3. Authenticated requests (reactive refresh)

`useFetchWithAuth` ([`src/lib/hooks/useFetchWithAuth.ts`](../src/lib/hooks/useFetchWithAuth.ts))
attaches the access token and transparently recovers from expiry. Because access
tokens last only 15 minutes, this is the mechanism that keeps a session alive
without the user noticing. All authenticated data hooks go through it
(`useAccountDetails`, `useCreatePin`, `useUpdatePin`, `useDeletePin`,
`useCreateBoard`, `HomePage`).

1. `useFetchWithAuth` sends the request with `Authorization: Bearer <access token>`.
2. **Not a 401** → the response is returned as-is.
3. **401** → it POSTs `/token/web/refresh/` (cookie):
   - **Refresh succeeds** → `200 { access_token }` (rotated cookie re-set); it
     calls `setAccessToken(new)` and retries the original request with the new
     token.
   - **Refresh fails** → `401`; it calls `logOut()` (clears the token, redirects
     to `/`).

Refresh-token rotation is transparent here: each refresh re-sets the cookie
server-side, and the browser stores it automatically.

**Concurrent 401s share one refresh (single-flight).** The refresh is issued
through the TanStack Query cache (`queryClient.fetchQuery` on the shared
`["refreshAccessToken"]` key), so simultaneous 401s await a single in-flight
refresh instead of each firing their own. This matters *because* refresh tokens
rotate: parallel refreshes would otherwise present the same cookie, and all but
the first would be rejected as already-rotated — logging the user out.

### 4. Logout

`useLogOut` calls the logout endpoint, clears the in-memory access token, and
reloads to `/`.

1. On logout, `useLogOut` sends `DELETE /token/web/` (browser attaches the cookie).
2. The backend revokes the refresh token and clears the cookie (`200`).
3. `useLogOut` calls `setAccessToken(null)` and navigates to `/`; the next
   startup refresh fails, leaving the app unauthenticated.

The backend **revokes the refresh token server-side** on logout, so it cannot be
reused. The access token is stateless and only in memory, so it is gone as soon
as the page unloads. Logout is **best-effort**: `useLogOut` clears the token and
redirects even if the request fails, so a failed call never leaves the user
stuck logged in.

### 5. Auth state machine

The app moves between three states — **Initializing** (on mount),
**Unauthenticated**, and **Authenticated**:

| From | To | Trigger |
|---|---|---|
| Initializing | Unauthenticated | startup refresh fails (no cookie / expired) |
| Initializing | Authenticated | startup refresh succeeds |
| Unauthenticated | Authenticated | login / signup succeeds |
| Authenticated | Unauthenticated | logout |
| Authenticated | Unauthenticated | a request's reactive refresh fails |

## Key files

| File | Role |
|---|---|
| [`src/contexts/authContext.tsx`](../src/contexts/authContext.tsx) | `AuthContext` + provider; runs the startup refresh; holds `accessToken`, `isAuthInitialized`. |
| [`src/pages/Layout.tsx`](../src/pages/Layout.tsx) | Gates routed content on `isAuthInitialized`; renders the authenticated vs. unauthenticated shell from `accessToken`. |
| [`src/lib/hooks/useFetchWithAuth.ts`](../src/lib/hooks/useFetchWithAuth.ts) | Adds the Bearer header; reactive refresh + retry on 401; logs out on failed refresh. |
| [`src/lib/hooks/useLogin.ts`](../src/lib/hooks/useLogin.ts) | Login — posts credentials, stores the access token. |
| [`src/lib/hooks/useSignup.ts`](../src/lib/hooks/useSignup.ts) | Signup — same shape as login. |
| [`src/lib/hooks/useLogOut.ts`](../src/lib/hooks/useLogOut.ts) | Logout — calls the endpoint, clears the token, redirects. |
| [`src/lib/hooks/useAccountDetails.ts`](../src/lib/hooks/useAccountDetails.ts) | Fetches `/accounts/me/` once authenticated. |
| [`src/lib/constants.ts`](../src/lib/constants.ts) | API URLs. |
