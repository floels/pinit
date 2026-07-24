# Authentication (backend)

This document describes how the backend issues, verifies, and revokes
authentication tokens. The client-side authentication flows are documented in [`web/doc/authentication.md`](../../../web/doc/authentication.md) and
[`mobile/doc/authentication.md`](../../../mobile/doc/authentication.md).

## Token scheme

Authentication relies on a two-token scheme:

| Token | Type | Stateful? | Lifetime | Revocable? |
|---|---|---|---|---|
| **Access token** | PASETO v4.local | No (stateless) | 15 minutes | No |
| **Refresh token** | opaque random string, DB-backed | Yes (one row per token) | 30 days | Yes |

Lifetimes are configured in [`pinit/settings/base.py`](../../pinit/settings/base.py)
as `ACCESS_TOKEN_LIFETIME` and `REFRESH_TOKEN_LIFETIME`.

### Access token — PASETO v4.local

A [PASETO](https://paseto.io/) v4.local token: an encrypted token.

- **Claims:** `sub` (the user's primary key, as a string), `exp`, `iat`.
- **Stateless:** nothing is stored server-side, so an access token cannot be
  individually revoked. This is why it is short-lived (15 min): a leaked token
  is only usable for a bounded window.
- **Key:** a 32-byte symmetric key, hex-encoded, read from the
  `PASETO_SYMMETRIC_KEY` setting. It is defined per environment (like
  `SECRET_KEY`) and is **not** derived from `SECRET_KEY`. Generate one with:
  ```bash
  python -c "import secrets; print(secrets.token_hex(32))"
  ```

Implemented in [`lib/utils/tokens.py`](../lib/utils/tokens.py):

| Function | Purpose |
|---|---|
| `create_access_token(user)` | Returns `(token_str, expiration_utc)`. |
| `decode_access_token(token)` | Verifies + decodes; returns the claims dict, or raises `InvalidTokenError` (tampered, expired, malformed, or wrong key). |

The token library is [`pyseto`](https://github.com/dajiaji/pyseto).

### Refresh token — opaque, DB-backed, rotating

A random opaque string (`secrets.token_urlsafe(32)`) handed to the client. The
server stores **only its SHA-256 hash** ([`RefreshToken`](../models.py) model), so
a database leak exposes no usable tokens.

`RefreshToken` fields: `user`, `token_hash` (unique), `created_at`,
`expires_at`, `revoked_at` (nullable). A token is valid while it is neither
revoked nor past `expires_at`.

The token is rotated on every refresh: each call to a refresh endpoint
issues a new refresh token and revokes the presented one, so a captured-but-
superseded token stops working.

Implemented in [`lib/utils/refresh_tokens.py`](../lib/utils/refresh_tokens.py):

| Function | Purpose |
|---|---|
| `issue_refresh_token(user)` | Create a token; return the raw (unhashed) value. |
| `resolve_valid_user(raw_token)` | Return the owning user if the token is valid, else raise `InvalidRefreshTokenError`. |
| `revoke_refresh_token(raw_token)` | Mark the token revoked (no-op if unknown). |
| `rotate_refresh_token(raw_token)` | Validate + revoke the old token, issue a new one; return `(new_raw_token, user)`. |

## Verifying requests

`Authorization: Bearer <access-token>` is verified by
[`PasetoAuthentication`](../lib/authentication.py), wired as the sole
`DEFAULT_AUTHENTICATION_CLASSES` entry in `REST_FRAMEWORK`:

1. No `Bearer` header → `authenticate()` returns `None` (request is anonymous).
2. A `Bearer` token that fails to decode → `AuthenticationFailed` (401).
3. A valid token whose `sub` matches no user → `AuthenticationFailed` (401).
4. Otherwise → `(user, token)`.

By default, DRF **downgrades an authentication failure to 403** unless the
authentication class's `authenticate_header()` returns a value; when it does, the
response stays a **401** and that value becomes the `WWW-Authenticate` header.
`PasetoAuthentication` returns `"Bearer"`, so unauthenticated requests to
protected views get a **401** rather than a 403. The 401 body is then normalised
to `{"errors": [{"code": "unauthorized"}]}` by
[`handle_unauthorized_exception`](../lib/utils/exception_handling.py).

## Endpoints

Token issuance goes through
[`get_tokens_data(user)`](../lib/utils/authentication.py), which returns
`{access_token, access_token_expiration_utc, refresh_token}`. Web and mobile
differ only in how the refresh token is delivered: web uses an httpOnly
cookie, mobile uses the JSON body.

| Method + path | View | Refresh token in/out |
|---|---|---|
| `POST /api/token/web/` | `TokenWebView.post` | login → sets httpOnly cookie |
| `DELETE /api/token/web/` | `TokenWebView.delete` | logout → **revokes** cookie's token, clears cookie |
| `POST /api/token/web/refresh/` | `RefreshTokenWebView` | reads cookie → rotates → re-sets cookie |
| `POST /api/token/mobile/` | `obtain_token_pair_mobile` | login → returns token in body |
| `POST /api/token/mobile/logout/` | `logout_mobile` | logout → **revokes** the token supplied in the body |
| `POST /api/token/mobile/refresh/` | `RefreshTokenMobileView` | reads body → rotates → returns new token in body |
| `POST /api/accounts/web/` | `sign_up_web` | signup → sets httpOnly cookie |
| `POST /api/accounts/mobile/` | `sign_up_mobile` | signup → returns token in body |

Views live in [`views/authentication.py`](../views/authentication.py) and
[`views/token_refresh.py`](../views/token_refresh.py).

### The refresh token cookie (web)

Set by `set_refresh_token_cookie` in [`views/authentication.py`](../views/authentication.py):
`httponly=True`, `secure=not DEBUG`, `samesite="None"` in production /`"Lax"` in
DEBUG (Chromium rejects `SameSite=None` without `Secure` over HTTP),
`max_age=30 days`, `path="/"`. The cookie name is `REFRESH_TOKEN_COOKIE_NAME`
(`refreshToken`).

## Refresh + rotation flow

A request to a refresh endpoint (`POST /api/token/{web,mobile}/refresh/`) is
handled as follows:

1. **Extract the refresh token** — from the httpOnly cookie (web) or the JSON
   body (mobile).
2. **No token present** → respond `400 { "code": "missing_refresh_token" }`.
3. **Token present** → call `rotate_refresh_token(raw)`:
   - **Unknown, revoked, or expired** → respond
     `401 { "code": "invalid_refresh_token" }`.
   - **Valid** → revoke the presented token, insert a new refresh-token row, and
     mint a new access token via `create_access_token(user)`.
4. **On success** → respond `200` with the new access token and its expiry. The
   rotated refresh token is returned per client: web re-sets the httpOnly
   cookie; mobile returns `refresh_token` in the body.

## Revocation

- **Web logout** (`DELETE /api/token/web/`) revokes the presented refresh token
  server-side, then deletes the cookie. A captured refresh token cannot be
  reused after logout.
- **Mobile logout** (`POST /api/token/mobile/logout/`) revokes the refresh token
  supplied in the body, giving mobile the same server-side revocation as web.
  The mobile client calls it **best-effort** — it still clears local tokens even
  if the request fails, so logout never gets stuck.
- **Rotation** revokes the previous refresh token on every successful refresh.
- **Access tokens are never individually revoked** — they are stateless. Their
  short (15-min) lifetime bounds exposure instead.

## Error codes

| Code | When |
|---|---|
| `unauthorized` | Any 401 from `PasetoAuthentication` (missing/invalid/expired access token). |
| `invalid_refresh_token` | Refresh token is unknown, revoked, or expired. |
| `missing_refresh_token` | No refresh token supplied to a refresh endpoint. |
| `invalid_email` / `invalid_password` | Login credential failures. |

Defined in [`lib/constants.py`](../lib/constants.py).

## Key files

| File | Role |
|---|---|
| `lib/utils/tokens.py` | PASETO access-token mint/verify. |
| `lib/utils/refresh_tokens.py` | Opaque refresh-token issue/validate/revoke/rotate. |
| `lib/utils/authentication.py` | `get_tokens_data` — bundles a fresh access + refresh token. |
| `lib/authentication.py` | `PasetoAuthentication` DRF authentication class. |
| `models.py` | `RefreshToken` model. |
| `views/authentication.py` | Web login/logout, mobile obtain/logout, cookie helper. |
| `views/token_refresh.py` | Web + mobile refresh (rotating) views. |
| `pinit/settings/base.py` | Token lifetimes, `REST_FRAMEWORK` auth class. |
