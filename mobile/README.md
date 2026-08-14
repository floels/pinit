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
