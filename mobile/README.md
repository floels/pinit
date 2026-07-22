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
├── doc/                 # Developer documentation
├── translations/        # i18next translation resources
├── assets/              # Images and icons
├── app.json             # Expo app config
├── jest.config.ts       # Jest (jest-expo preset)
└── tsconfig.json        # TypeScript config
```

## Documentation

Developer documentation for the mobile app lives in the [`doc/`](doc) folder.

## Notes

- This is a **managed** Expo app (it runs in Expo Go). There is no committed
  `ios/`/`android/` project; those are generated on demand by `expo prebuild`
  and are git-ignored.
