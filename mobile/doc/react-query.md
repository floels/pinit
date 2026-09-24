# React Query (mobile)

This document covers how the mobile app names and scopes React Query keys.
Server state for accounts and pins lives in the query cache. Session gating
stays in Authentication Context; see
[`authentication.md`](./authentication.md).

There is **no** TypeScript `queryKeys` factory. Call sites pass string-literal
keys that must match the shapes below.

## Key naming rule

Every query key is an array built in three layers:

1. **Resource** — first element: a stable resource string in `camelCase`. Do not
   prefix it with `query` (use `"pin"`, not `"queryPin"`).
2. **Path segments** — next elements, when needed: fixed strings that narrow the
   resource (`"me"`, `"detail"`, `"board"`, …).
3. **Variables** — last element, when needed: a **single** serializable object
   that holds every variable input (`{ username }`, `{ id }`, `{ endpoint }`).

Examples of keys that follow the rule:

```ts
["account", "me"]
["account", "detail", { username: "alice" }]
["pin", "detail", { id: "42" }]
["pin", "board", { endpoint: "/api/pins/" }]
```

Do not scatter variables across the array (`["account", username]`), and do not
put two objects in one key.

## Target keys

| Query | Key |
|---|---|
| My account | `["account", "me"]` |
| Public account (Author) | `["account", "detail", { username }]` |
| Pin details | `["pin", "detail", { id }]` |
| Pins board | `["pin", "board", { endpoint }]` |

New queries should extend this table with the same three-layer shape rather than
inventing a parallel convention.

## Shared QueryClient

The app uses one module-level `QueryClient` instance
([`src/lib/queryClient.ts`](../src/lib/queryClient.ts)). `App.tsx` passes that
same instance to `QueryClientProvider`. Session teardown that clears the cache
must import this singleton so it clears the cache the UI is reading.
