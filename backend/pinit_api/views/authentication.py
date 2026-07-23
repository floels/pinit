from django.conf import settings
from rest_framework import status, views
from rest_framework.decorators import api_view
from rest_framework.response import Response

from ..models import User
from ..lib.constants import (
    ERROR_CODE_INVALID_EMAIL,
    ERROR_CODE_INVALID_PASSWORD,
    REFRESH_TOKEN_COOKIE_NAME,
)
from ..lib.utils.authentication import get_tokens_data
from ..lib.utils.refresh_tokens import revoke_refresh_token

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
    # Production uses HTTPS: SameSite=None + Secure for cross-domain support.
    # Development uses HTTP on 127.0.0.1: SameSite=Lax so the browser accepts
    # the cookie (Chromium rejects SameSite=None without Secure on HTTP).
    samesite = "None" if not settings.DEBUG else "Lax"
    response.set_cookie(
        REFRESH_TOKEN_COOKIE_NAME,
        refresh_token,
        httponly=True,
        secure=not settings.DEBUG,
        samesite=samesite,
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


@api_view(["POST"])
def logout_mobile(request):
    # Mobile has no httpOnly cookie, so the refresh token comes in the body.
    # Best-effort revocation: revoke if a known token was supplied, otherwise
    # succeed anyway (mirrors the tolerant web logout).
    refresh_token_str = request.data.get("refresh_token")

    if refresh_token_str:
        revoke_refresh_token(refresh_token_str)

    return Response(status=status.HTTP_200_OK)


class TokenWebView(views.APIView):
    def post(self, request):
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

    def delete(self, request):
        refresh_token_str = request.COOKIES.get(REFRESH_TOKEN_COOKIE_NAME)

        if refresh_token_str:
            revoke_refresh_token(refresh_token_str)

        response = Response(status=status.HTTP_200_OK)
        response.delete_cookie(REFRESH_TOKEN_COOKIE_NAME, path="/")
        return response
