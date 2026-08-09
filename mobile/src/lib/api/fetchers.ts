// This directory is the only place that is allowed to call the `fetch` global.
// An ESLint rule (`no-restricted-globals` in `eslint.config.js`) bans it
// everywhere else under 'src/'. Every network call therefore goes through the
// function below, or through `useAPI` for calls that carry the access token. A
// new call site cannot omit the token by accident: it has to name which kind of
// call it makes. This mirrors 'web/src/lib/api/'.

// A call that carries no credentials. It covers the public endpoints of our API
// (pin, board and account details, search, search suggestions) and the token
// endpoints (login, logout, refresh), which authenticate through the request
// body rather than a header. Web needs a separate fetcher for its token
// endpoints, because those rely on an httpOnly cookie. This client stores its
// refresh token itself, so the two cases look the same on the wire.
export const fetchPublic = (...args: Parameters<typeof fetch>) =>
  fetch(...args);
