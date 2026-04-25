from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from ..models import User
from ..lib.constants import (
    ERROR_CODE_INVALID_EMAIL,
    ERROR_CODE_INVALID_PASSWORD,
    REFRESH_TOKEN_COOKIE_NAME,
)
from ..lib.utils import get_tokens_data

DEMO_USER_EMAIL = "demo@pinit.com"


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


@api_view(["POST"])
def obtain_token_pair_mobile(request):
    user, error = get_user_from_credentials(
        request.data.get("email"), request.data.get("password")
    )

    if error:
        return error

    return Response(get_tokens_data(user))


@api_view(["GET"])
def obtain_demo_token_pair_mobile(request):
    try:
        user = User.objects.get(email=DEMO_USER_EMAIL)

    except User.DoesNotExist:
        return Response(
            {"errors": [{"code": ERROR_CODE_INVALID_EMAIL}]},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    return Response(get_tokens_data(user))


@api_view(["POST"])
def obtain_token_pair_web(request):
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
def obtain_demo_token_pair_web(request):
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


@api_view(["POST"])
def log_out_web(request):
    refresh_token_str = request.COOKIES.get(REFRESH_TOKEN_COOKIE_NAME)

    if refresh_token_str:
        try:
            RefreshToken(refresh_token_str).blacklist()
        except TokenError:
            pass

    response = Response(status=status.HTTP_200_OK)
    response.delete_cookie(REFRESH_TOKEN_COOKIE_NAME, path="/")
    return response
