from .access_tokens import create_access_token
from .refresh_tokens import issue_refresh_token


def get_tokens_data(user):
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
