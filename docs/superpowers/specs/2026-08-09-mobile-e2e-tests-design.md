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
3. **Log out.** Start from a logged-in state. Tap `tab-bar-button-profile`. Tap
   `log-out-button`. Assert that `log-in-button` is visible again.

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
├── scripts/
│   └── build-ios-e2e.sh   # prebuild when needed, then xcodebuild
├── e2e/
│   ├── jest.config.js     # Detox test environment, maxWorkers 1
│   ├── tsconfig.json      # adds the detox types
│   ├── helpers.ts         # credentials, launchSignedOut(), logIn(), tap()
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
| `mobile/e2e/helpers.ts` | Credentials, a signed-out launch, and the wait-then-tap step | Detox API |
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

### Detox synchronization is off

Detox normally waits for the app to become idle before each command. This app
never becomes idle, for two reasons:

- `Spinner` runs `Animated.loop`, which never ends. `LoadingOverlay` shows it
  during login.
- `LandingScreenGallery` scrolls for two minutes on every launch.

Detox counts a running animation as work in progress. The first run therefore
timed out in every hook at exactly 120002 ms, which matches the gallery
animation. `detox test --debug-synchronization` named the cause: one recurring
native timer, and one pending work item on the main queue.

The flows therefore launch the app with `detoxEnableSynchronization: 0` and wait
on explicit conditions instead. This is the same model as the Playwright suite,
which also polls for a selector. The consequence is a rule for the flows: a tap
must wait for its target first. The `tap()` helper in `e2e/helpers.ts` enforces
that, and every flow taps through it.

An alternative was to shorten the animations in an E2E build. That needs a way
to read launch arguments in JavaScript, which means a new native module in the
app for test purposes only. Explicit waits cost less and change no product code.

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

Each flow starts from a known signed-out state. `launchSignedOut()` runs
`xcrun simctl keychain <device> reset`, then launches with `delete: true`. The
data wipe alone is not enough: the keychain survives it, so the app would
restore the previous session and start on the authenticated tab bar.

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

Two files.

1. `src/navigators/UnauthenticatedNavigator/LoginScreen.tsx` gains
   `testID="login-screen-email-input"` and `testID="login-screen-password-input"`
   on its two `TextInput` components.
2. `src/navigators/BrowseMainNavigator/BrowseMainNavigator.tsx` gains
   `tabBarButtonTestID` for each of the four tabs. A tab bar icon renders nested
   views that all carry the icon testID, so `by.id("tab-bar-icon-user-icon")`
   matched several elements and Detox refused the tap. The button testID lands on
   the touchable, which is the correct tap target anyway.

Every other anchor already exists: `log-in-button`,
`login-screen-submit-button`, `pins-board-scroll-view`, and `log-out-button`.

## Error handling

| Failure | Handling |
|---|---|
| The API does not answer | `e2e-backend-up.sh` polls for 60 seconds, then exits with an error and a clear message |
| Port 8000 is taken | The script detects the conflict and tells the user to stop `docker-compose.local.yml` |
| A stale session exists | `launchSignedOut()` resets the simulator keychain before each launch |
| A build fails | `detox build` exits non-zero, and `make` stops |
| A flow fails | Detox writes the artifacts, including a screenshot, under `mobile/artifacts/` |

`mobile/artifacts/` is added to `mobile/.gitignore`.

## Results

Measured on a Mac with Xcode 26.6 and an iPhone 16 simulator:

| Check | Result |
|---|---|
| `expo prebuild -p ios` | 35 s |
| First Release build | 169 s |
| Rebuild after a JavaScript change | 26 s |
| The three flows | 3 passed, 22.7 s |
| A second consecutive run | 3 passed, 22.7 s |
| `yarn jest` | 104 passed |
| `yarn lint` and `yarn type-check` | clean |

Detox 20.51.4 works with React Native 0.86 and Expo 57 on the iOS Simulator,
with no native source change and without `@config-plugins/detox`.

## Risks

- **Release builds are slow.** The first build takes about three minutes. The
  `ios.sim.debug` configuration keeps iteration fast.
- **Port 8000 collides** with `docker-compose.local.yml`. The web suite has the
  same constraint today.
- **The keychain reset is device-wide.** `simctl keychain reset` clears the
  keychain of the whole simulator, not of one app. This is acceptable on a test
  simulator, and it is the only reliable way to clear `expo-secure-store`.
- **Synchronization stays off.** A new flow must wait for its target before it
  taps. The `tap()` helper covers that, but a flow that calls the Detox API
  directly can race. Prefer the helpers.
- **Detox and the Expo SDK are coupled.** An Expo or React Native upgrade can
  break the build. Delete `ios/` and rebuild after such an upgrade.

## Resolved during implementation

Two problems that the design did not predict, both fixed:

1. The app never becomes idle, so Detox synchronization had to go off. See
   "Detox synchronization is off" above.
2. `by.id` on a tab bar icon matched several nested elements, so the tab needed
   `tabBarButtonTestID`. See "Production code changes" above.

## Prerequisites for a developer

- Xcode with an iOS Simulator runtime.
- `applesimutils`: `brew tap wix/brew && brew install applesimutils`.
- Docker running on the host.
- Node 22.16.0 and Yarn Classic 1.22.22, as the mobile README describes.

## Second iteration

The first iteration deferred every flow except authentication. The second
iteration adds three, which brings the suite to nine cases in four files.

| File | Cases |
|---|---|
| `search.test.ts` | Results for the seeded term. The no-results message. |
| `pin-details.test.ts` | Open a pin from the board and go back. Open the author. |
| `pin-creation.test.ts` | Create a pin from a photo. The hidden Next button. |

Pin creation was the flow the first design called too expensive, because it
needs a photo and a permission. Both turned out cheap:

- `xcrun simctl addmedia` puts a photo in the simulator library. The library
  belongs to the device, so one call in `beforeAll` covers every launch.
- Detox grants the permission at launch with `permissions: { photos: "YES" }`,
  so no system dialog appears.

### New helper: tapUntilVisible

Three failures during this iteration shared one cause. Synchronization is off,
so Detox acts on a view that can still move:

1. The create modal slides in. Detox called the button visible while it was
   off-screen, and the press was lost.
2. The camera roll grid re-laid out as thumbnails loaded. The tap point moved
   between runs, and Detox reported "View is not hittable at its visible point".
3. The keyboard covered the submit button, which sits at the bottom of the
   screen under `flex: 1` and `justifyContent: "flex-end"`.

Cases 1 and 2 are the same problem, and `tapUntilVisible(target, expected)`
solves both. It taps, waits for the element that proves the tap worked, and
retries. It reads better than a pause, because it names the intent. The Next
button on the image picker is a good example: it renders only once a selection
exists, so it is exactly the proof that the selection registered.

Case 3 is ordinary keyboard handling. Both inputs are single line, so
`tapReturnKey()` on the description closes the keyboard.

### Results

Measured from a freshly seeded database:

| Check | Result |
|---|---|
| The nine flows | 9 passed, 106 s |
| A second consecutive run, no re-seed | 9 passed, 106 s |
| `yarn jest` | 103 passed |
| `yarn lint` and `yarn type-check` | clean |

The suite is repeatable without a re-seed, which matters because pin creation
writes a row on every run.

No production code changed in this iteration. Every anchor the new flows need
already existed.
