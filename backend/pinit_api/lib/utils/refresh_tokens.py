import hashlib
import secrets

from django.conf import settings
from django.utils import timezone

from pinit_api.models import RefreshToken


class InvalidRefreshTokenError(Exception):
    """Raised when a refresh token is unknown, revoked, or expired."""


def hash_refresh_token(raw_token):
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def issue_refresh_token(user):
    """Create a refresh token for ``user`` and return the raw (unhashed) value.

    Only the hash is stored; the raw value is returned once and never persisted.
    """
    raw_token = secrets.token_urlsafe(32)
    RefreshToken.objects.create(
        user=user,
        token_hash=hash_refresh_token(raw_token),
        expires_at=timezone.now() + settings.REFRESH_TOKEN_LIFETIME,
    )
    return raw_token


def _get_token_object(raw_token):
    return RefreshToken.objects.filter(
        token_hash=hash_refresh_token(raw_token)
    ).first()


def resolve_valid_user(raw_token):
    """Return the user owning ``raw_token`` if it is valid, else raise."""
    token_object = _get_token_object(raw_token)
    if token_object is None or not token_object.is_valid:
        raise InvalidRefreshTokenError()
    return token_object.user


def revoke_refresh_token(raw_token):
    """Revoke ``raw_token`` if it exists. A no-op for unknown tokens."""
    token_object = _get_token_object(raw_token)
    if token_object is not None:
        token_object.revoke()


def rotate_refresh_token(raw_token):
    """Validate ``raw_token``, revoke it, and issue a fresh one for the same user.

    Returns ``(new_raw_token, user)``. Raises ``InvalidRefreshTokenError`` if the
    presented token is not valid.
    """
    token_object = _get_token_object(raw_token)
    if token_object is None or not token_object.is_valid:
        raise InvalidRefreshTokenError()

    token_object.revoke()
    new_raw_token = issue_refresh_token(token_object.user)
    return new_raw_token, token_object.user
