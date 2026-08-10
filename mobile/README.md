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
yarn type-check    # TypeScript type-check (app and e2e/)
```

Or from the repo root:

```bash
make test-mobile   # installs deps (Yarn Classic via Corepack) and runs Jest
```

### End-to-end tests

[Detox](https://wix.github.io/Detox/) drives the real app on the iOS Simulator
against the real API. The flows live in [`e2e/`](e2e).

Two decisions behind that setup:

- **Detox over [Maestro](https://maestro.mobile.dev/).** Maestro needs no native
  build, but its flows are YAML. Detox is TypeScript on Jest, which matches the
  Playwright suite in [`../e2e-tests-web`](../e2e-tests-web). The cost is a
  native build, so the app is no longer purely managed at test time.
- **No `@config-plugins/detox`.** It declares `expo: ^53` as a peer, and it only
  matters for Android. On the iOS Simulator, Detox injects its native library at
  launch, so the `expo prebuild` output needs no source change.

Prerequisites:

- Xcode with an iOS Simulator runtime.
- `applesimutils`:

  ```bash
  brew tap wix/brew
  brew trust --formula wix/brew/applesimutils
  brew install applesimutils
  ```

Run the whole suite from the repo root:

```bash
make test-e2e-mobile
```

That target starts the E2E backend, builds the app, and runs the flows. Stop the
local stack first, because both stacks bind port 8000.

From this directory, once the backend runs:

```bash
yarn test:e2e:build   # xcodebuild for the simulator, in Release
yarn test:e2e         # run the flows
```

While you write a flow, the debug configuration avoids a rebuild after every
JavaScript change. Start Metro with `yarn start`, then:

```bash
detox build --configuration ios.sim.debug
detox test --configuration ios.sim.debug
```

`scripts/build-ios-e2e.sh` runs `expo prebuild -p ios` only when `ios/` is
absent. Delete `ios/` after a change to `app.json` or to the Expo dependencies.

**Writing a new flow.** Detox synchronization is off, because the app animates
without end: `Spinner` runs `Animated.loop`, and the landing gallery scrolls for
two minutes. Detox treats a running animation as work in progress, so it would
never consider the app idle. The flows therefore wait on explicit conditions,
the same way the Playwright suite does. Three rules follow:

- Tap through the `tap()` helper in [`e2e/helpers.ts`](e2e/helpers.ts). It waits
  for the target first.
- Tap a target that animates through `tapUntilVisible(target, expected)`. Detox
  reports an element as visible while it still slides in or re-lays out, so a
  plain tap either loses the press or reports "View is not hittable at its
  visible point". The helper retries and confirms the effect. The create modal
  and the camera roll grid both need it.
- Start each test with `launchSignedOut()`. It resets the simulator keychain,
  which is the only reliable way to clear `expo-secure-store`. To assert what
  survives a restart instead, use `relaunchKeepingSession()`.
- Target one item in a list by its own testID. A pin thumbnail carries
  `pin-thumbnail-<pin id>`, so a flow can open a known seeded pin. Do not try to
  match the title or the author name inside it: the thumbnail's touchable is
  accessible, so it collapses its texts into a single accessibility element and
  `by.text` finds nothing.
- Reach for `waitForNthVisible(testID, index)` only when any item will do, for
  example to assert that a board rendered at all. A bare `by.id` that matches
  several elements stays ambiguous until it times out, and the timeout then
  reads as "the element never appeared".
- Scroll before you tap something further down a board, with
  `scrollUntilVisible(testID, "pins-board-scroll-view")`. Detox needs 75% of an
  element to be visible, and a partially visible pin does not qualify.
- Do not count list items by existence. A tab that the user has visited stays
  mounted, so its thumbnails still exist while another tab is on screen.

Detox writes screenshots and logs for a failed flow under `artifacts/`. To
capture them on demand, add `--take-screenshots failing` or `--loglevel verbose`,
which also dumps the view hierarchy on a failed match.

The suite covers these flows:

| File | Covers |
|---|---|
| `authentication.test.ts` | Log in, wrong password, log out |
| `session.test.ts` | The session survives a relaunch, and a log out survives one too |
| `search.test.ts` | Search results for the seeded term, and the no-results message |
| `search-suggestions.test.ts` | Autocomplete from indexed pins, then search for the suggestion |
| `pin-details.test.ts` | Open a pin from the board, go back, open the author |
| `pin-creation.test.ts` | Create a pin from a photo, open it from the toast, and the hidden Next button |

`pin-creation.test.ts` needs a photo in the simulator library, so it adds
[`e2e/fixtures/pin-image.png`](e2e/fixtures) with `xcrun simctl addmedia`. Each
run adds one more copy, which is harmless on a test simulator. Detox grants the
photo permission at launch, so no system dialog appears.

CI does not run these tests. They need macOS and a simulator, so the
`mobile-checks` job only lints and type-checks them.

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
├── e2e/                 # Detox end-to-end flows (iOS Simulator)
├── scripts/             # build-ios-e2e.sh
├── doc/                 # Developer documentation
├── translations/        # i18next translation resources
├── assets/              # Images and icons
├── app.json             # Expo app config
├── jest.config.ts       # Jest for the unit tests (jest-expo preset)
├── .detoxrc.js          # Detox devices, apps, and build commands
└── tsconfig.json        # TypeScript config
```

## Documentation

Developer documentation for the mobile app lives in the [`doc/`](doc) folder.

## Notes

- This is a **managed** Expo app (it runs in Expo Go). There is no committed
  `ios/`/`android/` project; those are generated on demand by `expo prebuild`
  and are git-ignored.
