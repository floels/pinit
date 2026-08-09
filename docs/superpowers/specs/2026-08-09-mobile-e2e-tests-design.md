# Mobile E2E tests — design

Date: 2026-08-09

## Goal

Add end-to-end tests for the mobile app, in the same spirit as the Playwright
suite in `e2e-tests-web/`. The tests drive the real app on the iOS Simulator
against the real backend API.

## Decisions

| Decision | Choice | Reason |
|---|---|---|
| Where the tests run | Local only, on a Mac | Matches the web suite, which CI also does not run |
| Tool | Detox 20 on Jest | TypeScript flows, same language as the Playwright suite |
| Build | `expo prebuild` plus `xcodebuild` for the simulator | Detox needs a native binary |
| Platform | iOS Simulator only | The repo targets iOS. Android needs no work now |
| First scope | Three authentication test cases | Prove the harness before adding flows |
| Backend startup | Shared shell scripts in `scripts/` | One copy of the logic for both suites |

Detox was chosen over Maestro. Maestro needs no native build, but its flows are
YAML. The team preferred TypeScript and accepted the build cost.

## Scope

One test file, `mobile/e2e/authentication.test.ts`, with three cases.

1. **Log in with valid credentials.** Tap `log-in-button` on the landing screen.
   Fill the email and password fields. Tap `login-screen-submit-button`. Assert
   that `pins-board-scroll-view` is visible.
2. **Log in with a wrong password.** Assert that the error text appears, and
   that the app stays on the login screen.
3. **Log out.** Start from a logged-in state. Tap
   `tab-bar-icon-profile-picture`. Tap `log-out-button`. Assert that
   `log-in-button` is visible again.

Out of scope for this iteration:

- Pin creation, which needs a photo in the simulator library and a granted
  `expo-media-library` permission.
- Save pin, boards, search, and pin details.
- Android.
- A CI job that runs the flows.

## Architecture

### Layout

The tests live inside the app package. Detox resolves the app project and its
`node_modules`, so a top-level folder does not work.

```
mobile/
├── .detoxrc.js            # devices, apps, build commands
├── jest.config.ts         # gains testPathIgnorePatterns for e2e/
├── e2e/
│   ├── jest.config.js     # Detox test environment, maxWorkers 1
│   ├── tsconfig.json      # adds the detox types
│   ├── helpers.ts         # credentials, logIn(), ensureLoggedOut()
│   └── authentication.test.ts
scripts/
└── e2e-backend-up.sh      # starts the stack, migrates, seeds
docker-compose.e2e.yml     # moved from e2e-tests-web/
```

### Units and responsibilities

| Unit | Responsibility | Depends on |
|---|---|---|
| `scripts/e2e-backend-up.sh` | Start Docker services, wait for the API, migrate, seed | `docker-compose.e2e.yml` |
| `mobile/.detoxrc.js` | Describe the simulator, the app binary, and the build commands | Xcode, `applesimutils` |
| `mobile/e2e/helpers.ts` | Credentials and reusable login and logout steps | Detox API |
| `mobile/e2e/authentication.test.ts` | The three assertions | `helpers.ts` |

Each unit is replaceable on its own. A move from Detox to Maestro keeps
`scripts/` and the `testID` props unchanged.

### Detox configurations

- `ios.sim.release` — self-contained. The JavaScript bundle sits inside the
  binary. Use this for a full run.
- `ios.sim.debug` — loads JavaScript from Metro. Use this while writing flows,
  because a JavaScript change then needs no rebuild.

The build command runs `expo prebuild -p ios`, then `xcodebuild` against the
generated workspace, with `-derivedDataPath ios/build`. `mobile/.gitignore`
already ignores `/ios/`, so the generated project stays out of git.

`@config-plugins/detox` is not used. It declares `expo: ^53` as a peer, and it
is only needed for Android. On the iOS Simulator, Detox 20 injects its native
library at launch, so the prebuild output needs no source change.

## Data flow

1. `scripts/e2e-backend-up.sh` starts Postgres, Elasticsearch, Moto, the nginx
   S3 proxy, and Django from `docker-compose.e2e.yml`.
2. The script waits for the API, then runs `migrate`, `set_up_moto`,
   `index_all_pins`, and `seed_database_e2e`.
3. Detox builds the app and launches it on the simulator.
4. The app calls `http://127.0.0.1:8000/api`, which is hardcoded in
   `src/lib/constants.ts`. On the simulator, `127.0.0.1` resolves to the Mac
   host, so the app reaches the Dockerized API with no configuration change.
5. A flow logs in through the UI. The app stores its tokens in
   `expo-secure-store`.

`seed_database_e2e` already creates `e2e_test@example.com` with the password
`testpassword123`. Both suites therefore share one fixture set.

The web helper `loginAsTestUser` does not port. It injects a refresh cookie into
the browser context. `expo-secure-store` writes to the iOS keychain, which no
outside process can write, so every mobile flow logs in through the UI.

## Shared scripts

`docker-compose.e2e.yml` moves from `e2e-tests-web/` to the repo root, next to
`docker-compose.local.yml`. The startup steps move from
`e2e-tests-web/global.setup.ts` into `scripts/e2e-backend-up.sh`.

Files that change in the web suite:

- `e2e-tests-web/global.setup.ts` — calls the script instead of running the
  Docker commands itself.
- `e2e-tests-web/README.md` — records the new paths.

The `Makefile` gains `test-e2e-mobile`. It calls the script, then builds and
runs the Detox flows. `test-e2e` keeps its current behavior, because the
Playwright setup step still starts the stack.

## Production code changes

One file. `src/navigators/UnauthenticatedNavigator/LoginScreen.tsx` gains
`testID="login-screen-email-input"` and `testID="login-screen-password-input"`
on its two `TextInput` components. Every other anchor already exists:
`log-in-button`, `login-screen-submit-button`, `pins-board-scroll-view`,
`tab-bar-icon-profile-picture`, and `log-out-button`.

## Error handling

| Failure | Handling |
|---|---|
| The API does not answer | `e2e-backend-up.sh` polls for 60 seconds, then exits with an error and a clear message |
| Port 8000 is taken | The script detects the conflict and tells the user to stop `docker-compose.local.yml` |
| A stale session exists | `ensureLoggedOut()` logs out when the tab bar appears at start-up |
| A build fails | `detox build` exits non-zero, and `make` stops |
| A flow fails | Detox writes the artifacts, including a screenshot, under `mobile/artifacts/` |

`mobile/artifacts/` is added to `mobile/.gitignore`.

## Testing the tests

Verification order during implementation:

1. **Smoke test first.** Build the app, launch it, and assert that
   `log-in-button` is visible. This one step proves that Detox 20.51 works with
   React Native 0.86 and Expo 57. Write it as the first assertion of case 1, not
   as a separate file. No throwaway test gets committed.
2. Add the rest of the three authentication cases.
3. Run `yarn jest` to confirm that the unit tests still pass and that they do
   not pick up the `e2e/` folder.
4. Run `yarn lint` and `yarn tsc` to confirm that the new folder passes both.

## Risks

- **Detox 20.51 with React Native 0.86 is unproven in this repo.** No version
  pair here confirms the combination. Step 1 above is the gate. If the build or
  the launch fails, Maestro is the fallback, and the shared scripts and the new
  `testID` props still apply.
- **`expo-secure-store` survives a reinstall.** It writes to the iOS keychain,
  which an app delete on the simulator does not always clear. A case that
  expects the landing screen can therefore start logged in.
  `ensureLoggedOut()` covers this.
- **Release builds are slow.** Expect several minutes for the first build. The
  `ios.sim.debug` configuration keeps iteration fast.
- **Port 8000 collides** with `docker-compose.local.yml`. The web suite has the
  same constraint today.

## Prerequisites for a developer

- Xcode with an iOS Simulator runtime.
- `applesimutils`: `brew tap wix/brew && brew install applesimutils`.
- Docker running on the host.
- Node 22.16.0 and Yarn Classic 1.22.22, as the mobile README describes.
