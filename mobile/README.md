# Mobile

[Expo](https://expo.dev/) (React Native) app — the mobile client for the PinIt
platform. (The web frontend lives in [`../web`](../web).)

## Stack

- Expo SDK 57, React Native 0.86, React 19
- TypeScript 6, Yarn Classic (v1)
- React Navigation 7 (stack + bottom tabs)
- TanStack Query 5 (server state)
- react-i18next (i18n)
- Jest + React Native Testing Library (unit tests)

## Prerequisites

- **Node.js** 18+ (this repo is tested with Node 22)
- **Yarn Classic (v1)** — the app uses a v1 lockfile. If your global `yarn` is
  Berry (v2+), run the commands below via Corepack, e.g.
  `corepack yarn@1.22.22 <command>`, or use the `make` targets from the repo
  root which pin it for you.
- **Xcode** with an iOS Simulator (for iOS) — install from the App Store, then
  open it once to install the command-line tools and a simulator runtime.
- The **backend API running locally** (see below).

## Running locally

The app talks to the backend at `http://127.0.0.1:8000/api` (configured in
[`src/lib/constants.ts`](src/lib/constants.ts)). On the iOS Simulator,
`127.0.0.1` resolves to your Mac, so the Dockerized backend is reachable with no
extra configuration.

1. **Start the backend** from the repo root:

   ```bash
   make up          # starts the backend (Postgres, Elasticsearch, S3 mock, Django) + web app
   make seed        # optional: populate the DB and search index with test data
   ```

2. **Start the app** (from this `mobile/` directory):

   ```bash
   yarn install
   yarn ios         # starts Metro and opens the app in the iOS Simulator (Expo Go)
   ```

   Or, from the repo root (pins Yarn Classic via Corepack, installs, then runs):

   ```bash
   make mobile-ios
   ```

Other entry points (see `package.json`):

```bash
yarn start         # start Metro; choose a target from the interactive menu
yarn android       # open the app in an Android emulator
yarn web           # run the app in a browser
```

## Testing

```bash
yarn jest          # unit tests
yarn jest --coverage --runInBand   # with coverage (as CI runs them)
yarn lint          # ESLint
yarn tsc           # TypeScript type-check
```

Or from the repo root:

```bash
make test-mobile   # installs deps (Yarn Classic via Corepack) and runs Jest
```

## Structure

```
mobile/
├── App.tsx             # Root component — providers + navigation container
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React context providers (authentication, account)
│   ├── hooks/           # Custom hooks
│   ├── navigators/      # React Navigation structure (authenticated/unauthenticated, tabs, stacks)
│   └── lib/             # Constants, types, utils, testing helpers
├── translations/        # i18next translation resources
├── assets/              # Images and icons
├── app.json             # Expo app config
├── jest.config.ts       # Jest (jest-expo preset)
└── tsconfig.json        # TypeScript config
```

## Authentication

The app authenticates against the backend's mobile auth endpoints
(`token/mobile/` to log in, `token/mobile/refresh/` to refresh) using a
short-lived, stateless PASETO access token plus a longer-lived, opaque refresh
token. The refresh endpoint **rotates** the refresh token on every call: each
refresh returns — and the app persists — a new refresh token alongside the new
access token, and the presented refresh token is revoked server-side.

**Where tokens live** ([`src/lib/utils/authentication.ts`](src/lib/utils/authentication.ts)):

- `expo-secure-store` — the access token and the refresh token.
- `AsyncStorage` — the access token's expiry date and a cached profile-picture URL.

**Auth state** is a small reducer in
[`src/contexts/authenticationContext.tsx`](src/contexts/authenticationContext.tsx)
that tracks `isCheckingAccessToken` and `isAuthenticated`.

**The flow:**

1. **App launch (the gate).**
   [`NavigationContainer`](src/components/NavigationContainer/NavigationContainer.tsx)
   reads the access token from secure store:
   - No token → render the unauthenticated (login) tree.
   - Token present → `ensureFreshAccessToken()` refreshes it _before_ entering
     the authenticated tree, when the stored expiry is missing or within
     `TOKEN_REFRESH_BUFFER_BEFORE_EXPIRATION_MS` (2 minutes) of expiring. Refreshing
     up front — rather than concurrently with the first authenticated request —
     avoids a race where a screen fires a request with a stale token and gets a
     spurious 401. If the session can't be refreshed (no refresh token, or the
     refresh request fails), the stored tokens are cleared and the login screen
     is shown.
2. **Login.**
   [`LoginScreenContainer`](src/navigators/UnauthenticatedNavigator/LoginScreenContainer.tsx)
   POSTs the credentials to `token/mobile/`, persists the returned tokens and
   expiry, and dispatches `LOGGED_IN`.
3. **Authenticated requests.** `fetchWithAuthentication`
   ([`src/lib/utils/fetch.ts`](src/lib/utils/fetch.ts)) attaches
   `Authorization: Bearer <access token>` read from secure store. The gate
   refreshes proactively, but if a request still comes back **401** (clock skew,
   a token invalidated server-side, or an access-token lifetime shorter than a
   session), `fetchWithAuthentication` transparently calls `refreshAccessToken()`
   once, persists the new tokens (access token plus the rotated refresh token),
   and **retries the request** with it. The caller
   never sees the 401 unless the refresh itself fails. This "reactive" refresh
   mirrors the web app's `useFetchWithAuth` and is what lets the access token be
   short-lived without logging users out mid-session.
4. **401 handling.** A 401 only reaches the caller when the reactive refresh
   above _also_ failed — i.e. the session is genuinely dead (no refresh token, or
   the refresh request was itself rejected). In that case the consumer
   ([`useMyAccountDetails`](src/hooks/useMyAccountDetails.ts),
   [`PinsBoardContainer`](src/components/PinsBoard/PinsBoardContainer.tsx)) clears
   **all** stored auth data via `clearStoredAuthData()` and dispatches
   `GOT_401_RESPONSE`, returning to login. Clearing the tokens matters: otherwise
   a dead token would bounce the user in and out of the app on the next launch.
5. **Logout.**
   [`ProfileScreen`](src/navigators/BrowseMainNavigator/ProfileScreen.tsx) calls
   `clearStoredAuthData()` and dispatches `LOGGED_OUT`.

## Notes

- This is a **managed** Expo app (it runs in Expo Go). There is no committed
  `ios/`/`android/` project; those are generated on demand by `expo prebuild`
  and are git-ignored.
