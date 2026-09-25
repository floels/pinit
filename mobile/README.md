# PinIt mobile app

This folder contains the code, tests and documentation for the PinIt mobile app.

The web frontend lives in [`../web`](../web).

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
├── e2e-tests/           # Detox end-to-end flows (iOS Simulator)
├── scripts/             # build-ios-e2e.sh
├── doc/                 # Developer documentation
├── translations/        # i18next translation resources
├── assets/              # Images and icons
├── app.json             # Expo app config
├── jest.config.ts       # Jest for the unit tests (jest-expo preset)
├── .detoxrc.js          # Detox devices, apps, and build commands
└── tsconfig.json        # TypeScript config
```

## Running E2E

Detox iOS E2E is local-only for now (not a CI check yet). From the repo root:

```bash
make test-e2e-mobile
```

That brings up the shared E2E Docker backend (`scripts/e2e-backend-up.sh`), builds the
`ios.sim.release` app, and runs the suite under `e2e-tests/`. Requires Xcode, an
iPhone 16 simulator, applesimutils, and Docker.
