from rest_framework.authentication import BaseAuthentication, get_authorization_header
from rest_framework.exceptions import AuthenticationFailed

from pinit_api.models import User
from pinit_api.lib.utils.tokens import InvalidTokenError, decode_access_token

AUTH_SCHEME = "Bearer"


class PasetoAuthentication(BaseAuthentication):
    """DRF authentication backed by PASETO v4.local access tokens.

    Expects ``Authorization: Bearer <token>``. Returns ``None`` when no Bearer
    credentials are supplied (so the request is treated as anonymous); raises
    ``AuthenticationFailed`` when a Bearer token is present but invalid.
    """

    def authenticate(self, request):
        auth_header = get_authorization_header(request).split()

        if not auth_header or auth_header[0].lower() != AUTH_SCHEME.lower().encode():
            return None

        if len(auth_header) != 2:
            raise AuthenticationFailed("Invalid authorization header.")

        token = auth_header[1].decode("utf-8")

        try:
            claims = decode_access_token(token)
        except InvalidTokenError:
            raise AuthenticationFailed("Invalid or expired token.")

        user = User.objects.filter(pk=claims.get("sub")).first()
        if user is None:
            raise AuthenticationFailed("User not found.")

        return (user, token)

    def authenticate_header(self, request):
        # Returning a value makes DRF answer unauthenticated requests with 401
        # (rather than 403), matching the previous JWT behaviour.
        return AUTH_SCHEME
