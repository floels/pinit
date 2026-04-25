# Frontend

Vite + React SPA for the Pinit platform.

## Stack

- Vite 6, React 18, React Router 7
- TypeScript 5, pnpm
- TanStack Query 5 (server state)
- react-i18next (i18n)
- Jest + Testing Library (unit tests)

## Structure

```
frontend/
├── src/
│   ├── main.tsx         # Entry point — React root + global providers
│   ├── router.tsx       # React Router configuration
│   ├── i18n.ts          # i18next setup
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React context providers (auth, account, …)
│   ├── pages/           # Route-level components
│   └── lib/             # Hooks, utilities, types, testing helpers
├── doc/                 # Developer documentation
├── index.html           # Vite HTML entry point
├── vite.config.ts
├── jest.config.js       # Jest with ts-jest (jsdom environment)
└── tsconfig.app.json    # TypeScript config for application code
```

## Commands

```bash
pnpm dev           # dev server on port 3000
pnpm build         # production build → dist/
pnpm lint          # ESLint
pnpm test          # Jest unit tests
```

Type-check without emitting:

```bash
pnpm exec tsc -p tsconfig.app.json --noEmit
```

## Environment variables

Injected at build time via `vite.config.ts`:

| Variable | Description |
|---|---|
| `BACKEND_URL` | Backend API base URL (set to `http://backend:8000/api` by Docker Compose) |
| `ENVIRONMENT` | Runtime environment label |

## Documentation

See [`doc/authentication.md`](doc/authentication.md) for the two-token JWT auth flow used by the web frontend.
