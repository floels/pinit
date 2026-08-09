// This directory is the only place that is allowed to call the `fetch` global.
// An ESLint rule (`no-restricted-globals` in `eslint.config.mjs`) bans it
// everywhere else under 'src/'. Every network call therefore goes through one
// of the functions below, or through `useAPI` for calls that carry the access
// token. A new call site cannot omit the token by accident: it has to name
// which kind of call it makes.

// A read of our own API that needs no credentials: the public endpoints (pin,
// board and account details, search, search suggestions). The arguments are
// forwarded as given, so this stays a transparent alias of the global.
export const fetchPublic = (...args: Parameters<typeof fetch>) =>
  fetch(...args);

// A call to a token endpoint: login, signup, logout, refresh. These carry no
// access token. They rely on the httpOnly refresh cookie, which the browser
// attaches only when credentials are included.
export const fetchWithRefreshCookie = (
  url: string,
  options: RequestInit = {},
) => fetch(url, { ...options, credentials: "include" });

// A call to another origin: the S3 presigned upload, or a pin image download.
// The 'omit' is the reason this function exists. No cookie and no token of ours
// must ever reach a third party.
export const fetchExternal = (url: string, options: RequestInit = {}) =>
  fetch(url, { ...options, credentials: "omit" });
