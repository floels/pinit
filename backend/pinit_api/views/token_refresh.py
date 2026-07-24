from rest_framework import status, views
from rest_framework.response import Response

from ..lib.constants import (
    ERROR_CODE_INVALID_REFRESH_TOKEN,
    ERROR_CODE_MISSING_REFRESH_TOKEN,
    REFRESH_TOKEN_COOKIE_NAME,
)
from ..lib.utils.tokens import create_access_token
from ..lib.utils.refresh_tokens import (
    InvalidRefreshTokenError,
    rotate_refresh_token,
)
from .authentication import set_refresh_token_cookie


class RefreshTokenView(views.APIView):
    """Rotating refresh: validate the presented opaque refresh token, revoke it,
    issue a fresh one, and mint a new access token. Subclasses decide where the
    incoming token is read from and how the new one is returned."""

    def get_refresh_token(self, request):
        raise NotImplementedError

    def build_response(self, access_token, access_token_expiration_utc, new_refresh_token):
        raise NotImplementedError

    def post(self, request):
        refresh_token, error = self.get_refresh_token(request)

        if error:
            return error

        try:
            new_refresh_token, user = rotate_refresh_token(refresh_token)
        except InvalidRefreshTokenError:
            return Response(
                {"errors": [{"code": ERROR_CODE_INVALID_REFRESH_TOKEN}]},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        access_token, access_token_expiration_utc = create_access_token(user)

        return self.build_response(
            access_token,
            access_token_expiration_utc.isoformat(),
            new_refresh_token,
        )


class RefreshTokenMobileView(RefreshTokenView):
    def get_refresh_token(self, request):
        if "refresh_token" not in request.data:
            return None, Response(
                {"errors": [{"code": ERROR_CODE_MISSING_REFRESH_TOKEN}]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return request.data["refresh_token"], None

    def build_response(self, access_token, access_token_expiration_utc, new_refresh_token):
        return Response(
            {
                "access_token": access_token,
                "access_token_expiration_utc": access_token_expiration_utc,
                "refresh_token": new_refresh_token,
            }
        )


class RefreshTokenWebView(RefreshTokenView):
    def get_refresh_token(self, request):
        token = request.COOKIES.get(REFRESH_TOKEN_COOKIE_NAME)

        if not token:
            return None, Response(
                {"errors": [{"code": ERROR_CODE_MISSING_REFRESH_TOKEN}]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return token, None

    def build_response(self, access_token, access_token_expiration_utc, new_refresh_token):
        response = Response(
            {
                "access_token": access_token,
                "access_token_expiration_utc": access_token_expiration_utc,
            }
        )
        set_refresh_token_cookie(response, new_refresh_token)
        return response
