import json
from datetime import datetime, timezone

import pyseto
from django.conf import settings
from pyseto import Key, Paseto


class InvalidTokenError(Exception):
    """Raised when an access token cannot be verified — tampered, expired,
    malformed, or produced with a different key."""


def _get_key():
    # PASETO_SYMMETRIC_KEY is a 32-byte key, hex-encoded (see settings/base.py).
    raw_key = bytes.fromhex(settings.PASETO_SYMMETRIC_KEY)
    return Key.new(version=4, purpose="local", key=raw_key)


def create_access_token(user):
    """Mint a stateless PASETO v4.local access token for ``user``.

    Returns ``(token_str, expiration_utc)``. The subject claim (``sub``) carries
    the user's primary key so the token can be resolved back to a user on decode.
    """
    lifetime = settings.ACCESS_TOKEN_LIFETIME
    expiration_utc = datetime.now(timezone.utc) + lifetime

    paseto = Paseto.new(exp=int(lifetime.total_seconds()), include_iat=True)
    token = paseto.encode(_get_key(), {"sub": str(user.pk)}, serializer=json)

    return token.decode("utf-8"), expiration_utc


def decode_access_token(token):
    """Verify and decode a PASETO access token, returning its claims dict.

    Raises ``InvalidTokenError`` for any token that is tampered with, expired,
    malformed, or signed with a different key.
    """
    try:
        decoded = Paseto.new().decode(_get_key(), token, deserializer=json)
    except (pyseto.PysetoError, ValueError, TypeError, IndexError) as error:
        raise InvalidTokenError(str(error)) from error

    return decoded.payload
