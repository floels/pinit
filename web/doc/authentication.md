# Authentication (web)

This document covers the web app's authentication flow: how it stores tokens, drives the
auth lifecycle, and talks to the auth endpoints. You can learn more about the backend side of the authentication flow in
[`backend/pinit_api/doc/authentication.md`](../../backend/pinit_api/doc/authentication.md).
The mobile app has an authentication flow that differs from the web app, see
[`mobile/doc/authentication.md`](../../mobile/doc/authentication.md).

## Overview

The web frontend holds two tokens:

| Token | Where stored | Accessible to JS | Sent as |
|---|---|---|---|
| **Access token** | React context (in-memory) | Yes | `Authorization: Bearer …` header |
| **Refresh token** | httpOnly cookie (`refreshToken`) | No | sent automatically by the browser |

Keeping the access token in memory (not `localStorage`) limits XSS exposure;
keeping the refresh token in an httpOnly cookie prevents any script from reading
it. The refresh token cookie is set, rotated, and cleared entirely by the
backend — the web code never sees its value.

No credential is in `localStorage`. Two display values are:

| `localStorage` key | Value | Written by | Read by |
|---|---|---|---|
| `username` | Username of the logged-in account | the `/accounts/me/` query function (§1) | `HeaderAuthenticatedContainer` |
| `profilePictureURL` | URL of the profile picture | the `/accounts/me/` query function (§1) | `HeaderAuthenticatedContainer` |

Neither value grants access to the API. They let the header paint the profile
link on the first render, before `/accounts/me/` resolves. See §4 for their
lifetime after a logout.

## Auth state

`AuthContext` ([`src/contexts/authContext.tsx`](../src/contexts/authContext.tsx))
is the single source of truth:

```
accessToken: string | null   — null until obtained via startup refresh or login
isAuthInitialized: boolean   — false until the startup refresh attempt settles
sessionExpired: boolean      — true from a failed reactive refresh until a login or a dismissal
```

Alongside `setAccessToken`, the context exposes three session mutators:
`clearSession()` (drops the token and the cached display data), `endSession()`
(`clearSession()` plus `sessionExpired = true`), and `dismissSessionExpiry()`.
Logout uses the first, a failed refresh uses the second. A logout is not an
expiry, so only the second one prompts a login.

`isAuthInitialized` distinguishes "we haven't checked yet" from "we checked and
the user is unauthenticated". Without it, the app would briefly render as logged
out on every page load, even for authenticated users.

- `isAuthInitialized` is `true` once the startup refresh query settles, on
  success or on error.
- `accessToken` is the token from that query result, unless login, signup,
  logout or a reactive refresh has set an explicit value. An explicit value
  always takes precedence, so the `null` written by `clearSession` keeps the app
  unauthenticated even while the cached refresh result still holds a token.

The provider therefore holds two pieces of state: the explicit token, which is
`undefined` until something sets it, and the expiry flag.

## Flows

The access token gets refreshed at exactly two moments:

1. **Once on app load** — the startup refresh (§1) bootstraps the access token from the refresh cookie.
2. **Reactively, after a 401** — when an authenticated request is rejected
   because the access token has expired (or is otherwise invalid),
   `useAPI().fetchAuthenticated` refreshes once and retries the original
   request (§3).

Between those two events the access token simply sits in memory; the app only
discovers it has expired when a request comes back `401`. With the 15-minute
lifetime, that means a lazy refresh — at most roughly once per 15 minutes of
activity, triggered by the first request that fails.

### 1. App startup

`AuthContextProvider` runs a one-shot Query
on mount that calls the refresh endpoint (the browser attaches the httpOnly
cookie automatically). `Layout` withholds the routed content until the attempt
settles, to avoid a flash of unauthenticated UI.

1. On mount, `AuthContextProvider` POSTs `/token/web/refresh/` (the browser
   attaches the httpOnly cookie automatically). While the query is pending,
   `isAuthInitialized` reads `false`.
2. **Refresh token valid** → `200 { access_token }` (backend re-sets the rotated
   refresh cookie); `accessToken` reads the token from the query result, and
   `isAuthInitialized` reads `true`.
3. **No cookie / expired** → `401`; `isAuthInitialized` reads `true` and
   `accessToken` stays `null`.
4. Throughout, `Layout` gates `<Outlet />` on `isAuthInitialized` (spinner until
   the attempt settles).

Once the attempt settles and an access token exists, `AccountContextProvider`
([`src/contexts/accountContext.tsx`](../src/contexts/accountContext.tsx))
fetches `/accounts/me/` through `useAPI().fetchAuthenticated`. The provider hosts that
query and passes the result through the context, so the query cache holds the
account. No Effect copies it into component state. The query function also
writes the two `localStorage` values listed in the Overview.

The query key carries the access token: `["fetchMyAccountDetails", accessToken]`.
A new access token is therefore a new cache entry. So after the reactive refresh
of §3 replaces the token, the provider refetches `/accounts/me/`, and `account`
reads `null` until the new request resolves. During that window the header falls
back to the `localStorage` values.

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

`useAPI` ([`src/lib/api/useAPI.ts`](../src/lib/api/useAPI.ts)) is the single
entry point for API traffic. Its `fetchAuthenticated` method attaches the access
token and transparently recovers from expiry. Because access tokens last only 15
minutes, this is the mechanism that keeps a session alive without the user
noticing. All authenticated data fetches go through it
(`AccountContextProvider`, `useCreatePin`, `useUpdatePin`, `useDeletePin`,
`useCreateBoard`, `useSavePin`, `HomePage`).

1. `fetchAuthenticated` sends the request with `Authorization: Bearer <access token>`.
2. **Not a 401** → the response is returned as-is.
3. **401** → it POSTs `/token/web/refresh/` (cookie):
   - **Refresh succeeds** → `200 { access_token }` (rotated cookie re-set); it
     calls `setAccessToken(new)` and retries the original request with the new
     token.
   - **Refresh fails** → `401`; it calls `endSession()`. No request is sent, and
     the current route is kept (§5).

Refresh-token rotation is transparent here: each refresh re-sets the cookie
server-side, and the browser stores it automatically.

**Concurrent 401s share one refresh (single-flight).** The refresh is issued
through the TanStack Query cache (`queryClient.fetchQuery` on the shared
`["refreshAccessToken"]` key), so simultaneous 401s await a single in-flight
refresh instead of each firing their own. This matters *because* refresh tokens
rotate: parallel refreshes would otherwise present the same cookie, and all but
the first would be rejected as already-rotated — logging the user out.

### 4. Logout

`useLogOut` calls the logout endpoint, clears the session, drops the cached
queries, and navigates to `/` with the router. No document reload happens.

1. On logout, `useLogOut` sends `DELETE /token/web/` (browser attaches the cookie).
2. The backend revokes the refresh token and clears the cookie (`200`).
3. `useLogOut` calls `clearSession()`, removes every cached query except the
   startup refresh, and calls `navigate("/")`.

The backend **revokes the refresh token server-side** on logout, so it cannot be
reused. The access token is stateless and only in memory. Logout is
**best-effort**: step 3 runs even if the request fails, so a failed call never
leaves the user stuck logged in.

**Why the cached queries go.** The next account to log in can be a different
person. Only the account query carries the access token in its key; pin
suggestions, boards and created pins do not, so a stale entry would surface under
the new account. The startup refresh entry is the one exception: it is active in
`AuthContextProvider`, and removing it starts a refetch that turns
`isAuthInitialized` back to `false` and paints a spinner over the route.

**`clearSession` also removes the cached display data.** It removes `username`
and `profilePictureURL` from `localStorage`. Neither one is a credential, so they
never kept a session alive. But they belong to the account that logged out.
Without this step, the header of the next account to log in on the same browser
shows the previous username and profile picture until `/accounts/me/` resolves.

### 5. An expired session

A reactive refresh fails only when the refresh token is gone, expired or revoked,
so the session is over. `fetchAuthenticated` calls `endSession()`, and the app
keeps the current URL.

1. `Layout` swaps to the unauthenticated shell. The route does not change.
2. `HeaderUnauthenticated` mounts, reads `sessionExpired`, and opens the login
   modal with the reason in it.
3. On a successful login, `setAccessToken` clears the flag, the authenticated
   shell returns, and the queries refetch on the same route.

The cached queries stay on this path: the person logging back in is the same
person. If the user dismisses the modal, `dismissSessionExpiry()` clears the flag
and the app is plainly **Unauthenticated**.

`PinCreationToolPage` redirects to `/` when no token exists, which would destroy
the URL. It therefore holds the route while `sessionExpired` is true, and
redirects once the flag clears.

The request that hit the 401 is **not** replayed after the login. The user
repeats the action.

### 6. Auth state machine

The app moves between four states — **Initializing** (on mount),
**Unauthenticated**, **Authenticated**, and **Expired**:

| From | To | Trigger |
|---|---|---|
| Initializing | Unauthenticated | startup refresh fails (no cookie / expired) |
| Initializing | Authenticated | startup refresh succeeds |
| Unauthenticated | Authenticated | login / signup succeeds |
| Authenticated | Unauthenticated | logout |
| Authenticated | Expired | a request's reactive refresh fails |
| Expired | Authenticated | the user logs back in |
| Expired | Unauthenticated | the user dismisses the prompt |

**Initializing** is reachable only on the first render. No transition returns to
it, because the app never reloads the document. **Expired** differs from
**Unauthenticated** only in that the login modal opens by itself and an
authenticated-only route holds its URL.

## Key files

| File | Role |
|---|---|
| [`src/contexts/authContext.tsx`](../src/contexts/authContext.tsx) | `AuthContext` + provider; runs the startup refresh; exposes `accessToken` and `isAuthInitialized`, both derived from that query, plus `sessionExpired` and the three session mutators. |
| [`src/pages/Layout.tsx`](../src/pages/Layout.tsx) | Gates routed content on `isAuthInitialized`; renders the authenticated vs. unauthenticated shell from `accessToken`. |
| [`src/lib/api/useAPI.ts`](../src/lib/api/useAPI.ts) | `fetchAuthenticated` — adds the Bearer header; reactive refresh + retry on 401; ends the session on failed refresh. Also exposes `fetchPublic` and `fetchExternal`. |
| [`src/lib/api/fetchers.ts`](../src/lib/api/fetchers.ts) | The only module allowed to call the `fetch` global. Holds `fetchPublic`, `fetchWithRefreshCookie` and `fetchExternal`. |
| [`src/lib/api/refreshAccessToken.ts`](../src/lib/api/refreshAccessToken.ts) | The shared refresh query key and fetcher. |
| [`src/lib/hooks/useLogin.ts`](../src/lib/hooks/useLogin.ts) | Login — posts credentials, stores the access token. |
| [`src/lib/hooks/useSignup.ts`](../src/lib/hooks/useSignup.ts) | Signup — same shape as login. |
| [`src/lib/hooks/useLogOut.ts`](../src/lib/hooks/useLogOut.ts) | Logout — calls the endpoint, clears the session, drops the cached queries, navigates to `/`. |
| [`src/components/Header/HeaderUnauthenticated.tsx`](../src/components/Header/HeaderUnauthenticated.tsx) | Holds the login and signup modals; opens the login modal by itself after an expiry. |
| [`src/contexts/accountContext.tsx`](../src/contexts/accountContext.tsx) | `AccountContext` + provider; fetches `/accounts/me/` once authenticated and passes the query result through the context. |
| [`src/lib/constants.ts`](../src/lib/constants.ts) | API URLs. |
