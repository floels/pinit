# React rules adoption

## Purpose

`eslint-plugin-react-hooks` v7 checks the Rules of React. Version 7 adds rules
that come from the React Compiler. These rules find impure renders, useless
Effects, and stale closures.

The plugin runs on every pull request that touches `web/`. See
`.github/workflows/check-pull-request.yml`.

## Current state

The full `recommended-latest` rule set is active. One rule is a warning instead
of an error, because known violations remain:

| Rule                              | Level   | Reason                          |
| --------------------------------- | ------- | ------------------------------- |
| `react-hooks/set-state-in-effect` | warning | 4 open violations, listed below |

`react-hooks/globals` is off for test files. A test harness captures hook output
in a module-level variable on purpose.

`react-hooks/exhaustive-deps` is a warning. That is the level the plugin ships.

## Open violations

Each item below is a separate piece of work. Fix an item, then check that the
warning disappears.

### `set-state-in-effect` (4)

| File                                                     | Line | Planned fix                                                                    |
| -------------------------------------------------------- | ---- | ------------------------------------------------------------------------------ |
| `src/components/PinThumbnailsGrid/PinThumbnailsGrid.tsx` | 36   | Derive `numberOfColumns` from `viewportWidth` during render. Delete the state. |
| `src/components/AccountDetails/CreatedPinsContainer.tsx` | 28   | Reset the page with a `key` on the component instead of an Effect.             |
| `src/contexts/authContext.tsx`                           | 45   | Derive `accessToken` and `isAuthInitialized` from the query status.            |
| `src/components/Header/HeaderSearchBarContainer.tsx`     | 120  | Move the search suggestions to a TanStack query.                               |

### `exhaustive-deps` (9)

Five of the nine warnings come from one pattern. An Effect registers a DOM
listener with an empty dependency array. The handler closes over a prop. The
listener therefore keeps the first render's closure.

| File                                                      | Line |
| --------------------------------------------------------- | ---- |
| `src/components/OverlayModal/OverlayModal.tsx`            | 30   |
| `src/components/Header/HeaderSearchBar.tsx`               | 59   |
| `src/components/Header/AccountOptionsFlyoutContainer.tsx` | 44   |
| `src/components/PinsBoard/SavePinFlyoutContainer.tsx`     | 49   |
| `src/components/PinsBoard/PinThumbnail.tsx`               | 84   |

React 19.2 provides `useEffectEvent` for this pattern. Wrap the handler in
`useEffectEvent`. The handler then reads the latest values, and the empty
dependency array becomes correct.

The four remaining warnings need individual attention:

- `src/components/LandingPageContent/PictureSlider.tsx:120` — the Effect reads
  `state.previousStep` but depends on `state.currentStep`. Change the dependency
  to the value that the Effect reads.
- `src/components/Header/HeaderSearchBarContainer.tsx:129` — `debounce()` builds
  a new object on every render. The move to a TanStack query removes it.
- `src/lib/hooks/useAccountDetails.ts:47` — `setAccount` is missing from the
  dependency array. The Effect also writes to `localStorage`. Move that write
  into the query function.
- `src/pages/Layout.tsx:26` — `t` is missing from the dependency array.

## How to restore a rule to error

1. Fix every violation of the rule.
2. Run `pnpm lint` and confirm that no warning for the rule remains.
3. Delete the rule from the adoption ramp block in `eslint.config.mjs`.
4. Delete the rule from the table in this file.
