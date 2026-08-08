# Web

Vite + React SPA — the web frontend for the PinIt platform. (The mobile
app lives in [`../mobile`](../mobile).)

## Stack

- Vite 8, React 19, React Router 8
- React Compiler (enabled in the Vite build — see `vite.config.ts`)
- TypeScript 5, pnpm
- TanStack Query 5 (server state)
- react-i18next (i18n)
- Vitest + Testing Library (unit tests)

## Structure

```
web/
├── src/
│   ├── main.tsx          # Entry point — React root + global providers
│   ├── router.tsx        # React Router configuration
│   ├── i18n.ts           # i18next setup
│   ├── declarations.d.ts # Module declaration for CSS modules
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React context providers (auth, account, …)
│   ├── pages/            # Route-level components
│   ├── styles/           # Global stylesheet
│   └── lib/              # Hooks, utilities, types, testing helpers
├── doc/                  # Developer documentation
├── index.html            # Vite HTML entry point
├── vite.config.ts        # Vite build, and the Vitest configuration
├── setupTests.ts         # Test setup — fetch mock, matchers, react-i18next mock
└── tsconfig.app.json     # TypeScript config for application code
```

## Commands

```bash
pnpm dev           # dev server on port 3000
pnpm build         # production build → dist/
pnpm start         # serve the production build (vite preview)
pnpm lint          # ESLint
pnpm type-check    # TypeScript type-check (no emit)
pnpm test          # Vitest unit tests
```

## Environment variables

Read at build time and inlined by `vite.config.ts`:

| Variable | Description |
|---|---|
| `BACKEND_URL` | Backend API base URL. `docker-compose.local.yml` sets `http://localhost:8000/api`, which is also the fallback in `src/lib/constants.ts`. Keep both on `localhost`: the refresh token cookie is `SameSite=Lax` in development, and a browser treats `localhost` and `127.0.0.1` as different sites. |

## Documentation

Developer documentation for the web frontend lives in the [`doc/`](doc) folder.
