from rest_framework import status, views
from rest_framework.response import Response

from pinit_api.domain.auth import (
    InvalidSessionError,
    rotate_session,
    set_refresh_token_cookie,
)
from pinit_api.shared.constants import (
    ERROR_CODE_INVALID_REFRESH_TOKEN,
    ERROR_CODE_MISSING_REFRESH_TOKEN,
    REFRESH_TOKEN_COOKIE_NAME,
)


class RefreshTokenView(views.APIView):
    """Rotating refresh: subclasses decide where the incoming refresh token is
    read from and how the new session is returned; session rotation itself lives
    in ``domain.auth``."""

    def get_refresh_token(self, request):
        raise NotImplementedError

    def build_response(self, session):
        raise NotImplementedError

    def post(self, request):
        refresh_token, error = self.get_refresh_token(request)

        if error:
            return error

        try:
            session = rotate_session(refresh_token)
        except InvalidSessionError:
            return Response(
                {"errors": [{"code": ERROR_CODE_INVALID_REFRESH_TOKEN}]},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return self.build_response(session)


class RefreshTokenMobileView(RefreshTokenView):
    def get_refresh_token(self, request):
        if "refresh_token" not in request.data:
            return None, Response(
                {"errors": [{"code": ERROR_CODE_MISSING_REFRESH_TOKEN}]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return request.data["refresh_token"], None

    def build_response(self, session):
        return Response(
            {
                "access_token": session["access_token"],
                "access_token_expiration_utc": session["access_token_expiration_utc"],
                "refresh_token": session["refresh_token"],
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

    def build_response(self, session):
        response = Response(
            {
                "access_token": session["access_token"],
                "access_token_expiration_utc": session["access_token_expiration_utc"],
            }
        )
        set_refresh_token_cookie(response, session["refresh_token"])
        return response
