import pytz
from datetime import datetime
from django.conf import settings
from rest_framework_simplejwt.views import TokenViewBase
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework.response import Response

from ..models import User
from ..lib.constants import (
    ERROR_CODE_INVALID_EMAIL,
    ERROR_CODE_INVALID_PASSWORD,
)
from ..lib.utils import get_tokens_data

ERROR_CODE_INVALID_REFRESH_TOKEN = "invalid_refresh_token"
ERROR_CODE_MISSING_REFRESH_TOKEN = "missing_refresh_token"
DEMO_USER_EMAIL = "demo@pinit.com"
REFRESH_TOKEN_COOKIE_NAME = "refreshToken"


def get_user_from_credentials(email, password):
    """Returns (user, error_response). Exactly one of the two is None."""
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return None, Response(
            {"errors": [{"code": ERROR_CODE_INVALID_EMAIL}]},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.check_password(password):
        return None, Response(
            {"errors": [{"code": ERROR_CODE_INVALID_PASSWORD}]},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    return user, None


def set_refresh_token_cookie(response, refresh_token):
    response.set_cookie(
        REFRESH_TOKEN_COOKIE_NAME,
        refresh_token,
        httponly=True,
        secure=not settings.DEBUG,
        samesite="Strict",
        max_age=30 * 24 * 60 * 60,
        path="/",
    )


# ── Mobile endpoints (tokens returned in response body) ──────────────────────

@api_view(["POST"])
def obtain_token_pair(request):
    user, error = get_user_from_credentials(
        request.data.get("email"), request.data.get("password")
    )
    if error:
        return error
    return Response(get_tokens_data(user))


@api_view(["GET"])
def obtain_demo_token_pair(request):
    try:
        user = User.objects.get(email=DEMO_USER_EMAIL)
    except User.DoesNotExist:
        return Response(
            {"errors": [{"code": ERROR_CODE_INVALID_EMAIL}]},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    return Response(get_tokens_data(user))


# https://github.com/jazzband/djangorestframework-simplejwt/blob/master/rest_framework_simplejwt/views.py#L63-L69
class RefreshTokenView(TokenViewBase):
    _serializer_class = (
        "pinit_api.serializers.token_serializers.CustomTokenRefreshSerializer"
    )

    def get_refresh_token(self, request):
        if "refresh_token" not in request.data:
            return None, Response(
                {"errors": [{"code": ERROR_CODE_MISSING_REFRESH_TOKEN}]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return request.data["refresh_token"], None

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


# ── Web endpoints (refresh token in httpOnly cookie) ─────────────────────────

@api_view(["POST"])
def web_obtain_token_pair(request):
    user, error = get_user_from_credentials(
        request.data.get("email"), request.data.get("password")
    )
    if error:
        return error

    tokens_data = get_tokens_data(user)
    response = Response(
        {
            "access_token": tokens_data["access_token"],
            "access_token_expiration_utc": tokens_data["access_token_expiration_utc"],
        }
    )
    set_refresh_token_cookie(response, tokens_data["refresh_token"])
    return response


@api_view(["GET"])
def web_obtain_demo_token_pair(request):
    try:
        user = User.objects.get(email=DEMO_USER_EMAIL)
    except User.DoesNotExist:
        return Response(
            {"errors": [{"code": ERROR_CODE_INVALID_EMAIL}]},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    tokens_data = get_tokens_data(user)
    response = Response(
        {
            "access_token": tokens_data["access_token"],
            "access_token_expiration_utc": tokens_data["access_token_expiration_utc"],
        }
    )
    set_refresh_token_cookie(response, tokens_data["refresh_token"])
    return response


class WebRefreshTokenView(RefreshTokenView):
    def get_refresh_token(self, request):
        token = request.COOKIES.get(REFRESH_TOKEN_COOKIE_NAME)
        if not token:
            return None, Response(
                {"errors": [{"code": ERROR_CODE_MISSING_REFRESH_TOKEN}]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return token, None


@api_view(["POST"])
def web_log_out(request):
    response = Response(status=status.HTTP_200_OK)
    response.delete_cookie(REFRESH_TOKEN_COOKIE_NAME, path="/")
    return response
