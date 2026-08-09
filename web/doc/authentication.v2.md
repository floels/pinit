# Authentication (web)

> **Draft, not the live document.** This is a proposed rewrite of
> [`authentication.md`](./authentication.md), kept alongside it for review. A
> follow-up pull request reworks the two into one document.

This document covers the web app: where it keeps the two tokens, how its auth
state changes, and which endpoints it calls. The token protocol itself is
documented in
[`backend/pinit_api/doc/authentication.md`](../../backend/pinit_api/doc/authentication.md).
The mobile app has a different flow, documented in
[`mobile/doc/authentication.md`](../../mobile/doc/authentication.md).

## 1. What the browser holds

| Token | Where | Readable by JS | Sent as |
|---|---|---|---|
| **Access token** | React context, in memory | Yes | `Authorization: Bearer …` header |
| **Refresh token** | httpOnly cookie (`refreshToken`) | No | attached by the browser |

The access token stays out of `localStorage`, which limits XSS exposure. The
httpOnly cookie keeps the refresh token unreadable by any script. The backend
sets, rotates, and clears that cookie. The web code never sees its value.

`localStorage` holds no credential. It holds two display values:

| Key | Value | Written by | Read by |
|---|---|---|---|
| `username` | Username of the logged-in account | the account query (§5) | `HeaderAuthenticatedContainer` |
| `profilePictureURL` | URL of the profile picture | the account query (§5) | `HeaderAuthenticatedContainer` |

Neither value grants access to the API. They let the header paint the profile
link before `/accounts/me/` resolves. Logout removes both (§8).

## 2. The auth lifecycle

The app moves between three states.

```mermaid
stateDiagram-v2
    [*] --> Initializing
    Initializing --> Authenticated : the startup refresh returns a token
    Initializing --> Unauthenticated : the startup refresh returns no token
    Unauthenticated --> Authenticated : login or signup succeeds
    Authenticated --> Initializing : logout reloads the page
    Authenticated --> Initializing : a reactive refresh fails and logs out
```

Both exits from **Authenticated** pass through **Initializing**, because both
run a full page load. The startup refresh then fails, because no valid refresh
cookie remains. So the app lands in **Unauthenticated**.

| State | `accessToken` | `isAuthInitialized` | What renders |
|---|---|---|---|
| Initializing | `null` | `false` | the unauthenticated shell, with a spinner in place of the route |
| Unauthenticated | `null` | `true` | the unauthenticated shell and the route |
| Authenticated | a token | `true` | the authenticated shell and the route |

## 3. When the access token is refreshed

The app attempts a refresh at exactly two moments. It runs no timer, and it does
not track the expiry of the access token.

1. **Once on app load.** The startup refresh reads the refresh cookie (§5).
2. **After a 401.** `useFetchWithAuth` attempts one refresh (§7). If the refresh
   returns a token, it retries the request. If the refresh fails, it logs the
   user out.

Between those moments the access token sits in memory. The app discovers an
expired token only when a request returns 401. The access token lasts 15
minutes, so a refresh happens at most about once per 15 minutes of activity.

## 4. Auth state in React

`AuthContext` ([`src/contexts/authContext.tsx`](../src/contexts/authContext.tsx))
exposes three things:

```
accessToken: string | null   — null until the startup refresh or a login supplies one
isAuthInitialized: boolean   — false until the startup refresh settles
setAccessToken(value)        — sets an explicit token, or null
```

`isAuthInitialized` separates "not checked yet" from "checked, and the user is
unauthenticated". Without it, every page load would render as logged out for a
moment, even for an authenticated user.

The provider stores **one** value, `explicitAccessToken`. It computes the other
two on every render.

```mermaid
flowchart TD
    S["explicitAccessToken<br/>the only stored value"] --> Q{"is it undefined?"}
    Q -->|"no"| A2["accessToken = explicitAccessToken"]
    Q -->|"yes"| A1["accessToken = the token of the startup refresh, or null"]
    R["the startup refresh query"] --> A1
    R --> B["isAuthInitialized = true once the query settles"]
```

`explicitAccessToken` carries three meanings:

| Value | Meaning | Written by |
|---|---|---|
| `undefined` | Nobody set a token. `accessToken` follows the startup refresh. | the initial value |
| `null` | A token is explicitly absent, and this beats the refresh result. | logout, and a failed reactive refresh |
| a string | A token arrived outside the startup refresh. | login, signup, a reactive refresh |

**Why `null` and `undefined` must differ.** The result of the startup refresh
stays in the query cache. `undefined` means "follow that result". After a logout
that cached result can still hold a valid token. So logout writes `null`, which
keeps the app unauthenticated for the moments before the page reloads.

## 5. Flow: app startup

`AuthContextProvider` runs one query on mount against
`POST /token/web/refresh/`. The browser attaches the httpOnly cookie. `Layout`
withholds the route until that attempt settles, to avoid a flash of
unauthenticated UI.

```mermaid
sequenceDiagram
    autonumber
    participant P as AuthContextProvider
    participant L as Layout
    participant A as AccountContextProvider
    participant B as Backend

    P->>B: POST /token/web/refresh/ with the refresh cookie
    Note over L: isAuthInitialized is false, so Layout shows a spinner
    alt the refresh cookie is valid
        B-->>P: 200 and a new access token, plus a rotated cookie
        Note over P: accessToken reads that token
    else no cookie, or the cookie is expired
        B-->>P: 401
        Note over P: accessToken stays null
    end
    Note over L: isAuthInitialized is true, so Layout renders the route
    A->>B: GET /accounts/me/ with the Bearer token
    B-->>A: 200 and the account
```

The refresh query does not retry, and it does not refetch when the window
regains focus. A rejected refresh resolves to no token rather than to an error,
so `isAuthInitialized` turns `true` on both paths.

### The account query

Once the refresh settles and an access token exists, `AccountContextProvider`
([`src/contexts/accountContext.tsx`](../src/contexts/accountContext.tsx))
fetches `/accounts/me/` through `useFetchWithAuth`. The provider hosts that
query and passes its result through the context. The query cache therefore holds
the account. The query function also writes the two `localStorage` values of §1.

The query key carries the access token: `["fetchMyAccountDetails", accessToken]`.
A new access token is therefore a new cache entry. So after a reactive refresh
(§7) replaces the token, the provider fetches `/accounts/me/` again, and
`account` reads `null` until that request resolves. In that window the header
falls back to the `localStorage` values.

## 6. Flow: login and signup

Both flows return an access token in the body, and both make the backend set the
refresh cookie. No page reload is needed.

| Flow | Hook | Endpoint |
|---|---|---|
| Login | [`useLogin`](../src/lib/hooks/useLogin.ts) | `POST /token/web/` |
| Signup | [`useSignup`](../src/lib/hooks/useSignup.ts) | `POST /accounts/web/` |

1. The user submits the form.
2. **The backend accepts** → `200 { access_token }` plus the httpOnly refresh
   cookie. The hook calls `setAccessToken(token)`, and the authenticated shell
   renders.
3. **The backend rejects** → `401 { errors: [{ code }] }`. The form shows an
   error on the matching field.

## 7. Flow: authenticated request and reactive refresh

`useFetchWithAuth` ([`src/lib/hooks/useFetchWithAuth.ts`](../src/lib/hooks/useFetchWithAuth.ts))
attaches the access token and recovers from an expired one. This is the
mechanism that keeps a session alive without the user noticing. Every
authenticated fetch goes through it: `AccountContextProvider`, `useCreatePin`,
`useUpdatePin`, `useDeletePin`, `useCreateBoard`, and `HomePage`.

```mermaid
sequenceDiagram
    autonumber
    participant C as Caller
    participant F as useFetchWithAuth
    participant B as Backend

    C->>F: fetch a protected URL
    F->>B: the request, with the current Bearer token
    alt the response is not a 401
        B-->>F: the response
        F-->>C: the same response
    else the response is a 401
        B-->>F: 401
        F->>B: POST /token/web/refresh/ with the refresh cookie
        alt the refresh returns a token
            B-->>F: 200 and a new access token, plus a rotated cookie
            F->>F: setAccessToken with the new token
            F->>B: the same request, with the new Bearer token
            B-->>F: the response
            F-->>C: the response of the retry
        else the refresh fails
            B-->>F: 401
            F->>F: log the user out
            F-->>C: the original 401
        end
    end
```

The retry runs once. `useFetchWithAuth` returns whatever that retry produces,
including a second 401. Rotation stays invisible here, because each refresh
re-sets the cookie server-side and the browser stores it.

### Concurrent 401s share one refresh

The refresh runs through the query cache: `queryClient.fetchQuery` on the shared
`["refreshAccessToken"]` key. Simultaneous 401s therefore await one in-flight
refresh instead of each starting their own.

```mermaid
sequenceDiagram
    participant R1 as Request 1
    participant R2 as Request 2
    participant Q as Query cache
    participant B as Backend

    R1->>Q: fetchQuery on refreshAccessToken
    R2->>Q: fetchQuery on refreshAccessToken
    Q->>B: POST /token/web/refresh/ once
    B-->>Q: 200 and a new access token
    Q-->>R1: the same result
    Q-->>R2: the same result
```

This matters because refresh tokens rotate. Parallel refreshes would present the
same cookie. The backend would accept the first one and reject the rest as
already rotated, which would log the user out.

The startup refresh of §5 uses that same key, so it shares the deduplication.

## 8. Flow: logout

`useLogOut` ([`src/lib/hooks/useLogOut.ts`](../src/lib/hooks/useLogOut.ts)) ends
the session on the server and in the browser.

1. `useLogOut` sends `DELETE /token/web/`. The browser attaches the cookie.
2. The backend revokes the refresh token and clears the cookie.
3. `useLogOut` calls `setAccessToken(null)`, removes the two `localStorage`
   values of §1, and sets `window.location.href` to `/`.
4. The page reloads. The startup refresh finds no valid cookie, so the app lands
   in **Unauthenticated**.

Steps 3 and 4 run whether or not step 1 succeeded. **Logout is best-effort:** a
failed request must never leave the user stuck in a logged-in UI. On that path
the refresh token stays valid on the server until it expires.

The reload also drops the query cache, and with it the account.

## 9. Key files

| File | Role |
|---|---|
| [`src/contexts/authContext.tsx`](../src/contexts/authContext.tsx) | `AuthContext` and its provider. Runs the startup refresh. Exposes `accessToken` and `isAuthInitialized`, both derived. |
| [`src/contexts/accountContext.tsx`](../src/contexts/accountContext.tsx) | `AccountContext` and its provider. Fetches `/accounts/me/` once authenticated, and passes the query result through the context. |
| [`src/pages/Layout.tsx`](../src/pages/Layout.tsx) | Gates the route on `isAuthInitialized`. Picks the authenticated or unauthenticated shell from `accessToken`. |
| [`src/lib/hooks/useFetchWithAuth.ts`](../src/lib/hooks/useFetchWithAuth.ts) | Adds the Bearer header. Refreshes and retries once on a 401. Logs out when the refresh fails. |
| [`src/lib/utils/refreshAccessToken.ts`](../src/lib/utils/refreshAccessToken.ts) | The shared refresh key and fetcher, used by §5 and §7. |
| [`src/lib/hooks/useLogin.ts`](../src/lib/hooks/useLogin.ts) | Login. Posts the credentials, stores the access token. |
| [`src/lib/hooks/useSignup.ts`](../src/lib/hooks/useSignup.ts) | Signup. Same shape as login. |
| [`src/lib/hooks/useLogOut.ts`](../src/lib/hooks/useLogOut.ts) | Logout. Calls the endpoint, clears the token and the two `localStorage` values, reloads. |
| [`src/lib/constants.ts`](../src/lib/constants.ts) | The API URLs and the `localStorage` keys. |
