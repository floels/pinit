"""Auth session: issue, rotate, revoke, and web cookie delivery.

Views import session operations and cookies from this package. Access-token
crypto and refresh-token persistence stay in sibling modules and are not part
of the view-facing surface.
"""

from .access_tokens import InvalidTokenError, create_access_token, decode_access_token
from .cookies import clear_refresh_token_cookie, set_refresh_token_cookie
from .refresh_tokens import issue_refresh_token
from .request_auth import PasetoAuthentication
from .session import (
    InvalidSessionError,
    issue_session,
    revoke_session,
    rotate_session,
)

__all__ = [
    "InvalidSessionError",
    "InvalidTokenError",
    "PasetoAuthentication",
    "clear_refresh_token_cookie",
    "create_access_token",
    "decode_access_token",
    "issue_refresh_token",
    "issue_session",
    "revoke_session",
    "rotate_session",
    "set_refresh_token_cookie",
]
