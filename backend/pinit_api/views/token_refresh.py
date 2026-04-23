import pytz
from datetime import datetime
from rest_framework import status
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.views import TokenViewBase

from .authentication import (
    ERROR_CODE_INVALID_REFRESH_TOKEN,
    ERROR_CODE_MISSING_REFRESH_TOKEN,
    REFRESH_TOKEN_COOKIE_NAME,
)


# This view is taking inspiration from:
# https://github.com/jazzband/djangorestframework-simplejwt/blob/master/rest_framework_simplejwt/views.py#L63-L69
class RefreshTokenView(TokenViewBase):
    _serializer_class = (
        "pinit_api.serializers.token_serializers.CustomTokenRefreshSerializer"
    )

    def get_refresh_token(self, request):
        raise NotImplementedError

    def post(self, request):
        refresh_token, error = self.get_refresh_token(request)

        if error:
            return error

        serializer = self.get_serializer(data={"refresh": refresh_token})

        try:
            serializer.is_valid(raise_exception=True)

        except TokenError:
            return Response(
                {"errors": [{"code": ERROR_CODE_INVALID_REFRESH_TOKEN}]},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        access_token = serializer.validated_data["access_token"]
        access_token_exp = serializer.validated_data["access_token_exp"]
        access_token_expiration_utc = datetime.fromtimestamp(
            access_token_exp, tz=pytz.UTC
        )

        return Response(
            {
                "access_token": access_token,
                "access_token_expiration_utc": access_token_expiration_utc.isoformat(),
            }
        )


class RefreshTokenMobileView(RefreshTokenView):
    def get_refresh_token(self, request):
        if "refresh_token" not in request.data:
            return None, Response(
                {"errors": [{"code": ERROR_CODE_MISSING_REFRESH_TOKEN}]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return request.data["refresh_token"], None


class RefreshTokenWebView(RefreshTokenView):
    def get_refresh_token(self, request):
        token = request.COOKIES.get(REFRESH_TOKEN_COOKIE_NAME)

        if not token:
            return None, Response(
                {"errors": [{"code": ERROR_CODE_MISSING_REFRESH_TOKEN}]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return token, None
