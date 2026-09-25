from .access_tokens import create_access_token
from .refresh_tokens import (
    InvalidRefreshTokenError,
    issue_refresh_token,
    revoke_refresh_token,
    rotate_refresh_token,
)

# Re-export so callers catch session failures without reaching into refresh_tokens.
InvalidSessionError = InvalidRefreshTokenError


def issue_session(user):
    """Issue a fresh access + refresh token pair for ``user``.

    Returns a dict with ``access_token``, ``access_token_expiration_utc``
    (ISO string), and ``refresh_token`` (raw opaque value). Callers decide
    how the refresh token is delivered (JSON body vs httpOnly cookie).
    """
    access_token, access_token_expiration_utc = create_access_token(user)
    refresh_token = issue_refresh_token(user)

    return {
        "access_token": access_token,
        "access_token_expiration_utc": access_token_expiration_utc.isoformat(),
        "refresh_token": refresh_token,
    }


def rotate_session(raw_refresh_token):
    """Rotate the presented refresh token and mint a new access token.

    Returns the same shape as ``issue_session``. Raises ``InvalidSessionError``
    if the refresh token is unknown, revoked, or expired.
    """
    new_refresh_token, user = rotate_refresh_token(raw_refresh_token)
    access_token, access_token_expiration_utc = create_access_token(user)

    return {
        "access_token": access_token,
        "access_token_expiration_utc": access_token_expiration_utc.isoformat(),
        "refresh_token": new_refresh_token,
    }


def revoke_session(raw_refresh_token):
    """Revoke ``raw_refresh_token`` if it exists. A no-op for unknown tokens."""
    revoke_refresh_token(raw_refresh_token)
