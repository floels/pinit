from rest_framework import status, views
from rest_framework.decorators import api_view
from rest_framework.response import Response

from pinit_api.domain.auth import (
    clear_refresh_token_cookie,
    issue_session,
    revoke_session,
    set_refresh_token_cookie,
)
from pinit_api.shared.constants import (
    ERROR_CODE_INVALID_EMAIL,
    ERROR_CODE_INVALID_PASSWORD,
    REFRESH_TOKEN_COOKIE_NAME,
)

from ..models import User


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


@api_view(["POST"])
def obtain_token_pair_mobile(request):
    user, error = get_user_from_credentials(
        request.data.get("email"), request.data.get("password")
    )

    if error:
        return error

    return Response(issue_session(user))


@api_view(["POST"])
def logout_mobile(request):
    # Mobile has no httpOnly cookie, so the refresh token comes in the body.
    # Best-effort revocation: revoke if a known token was supplied, otherwise
    # succeed anyway (mirrors the tolerant web logout).
    refresh_token_str = request.data.get("refresh_token")

    if refresh_token_str:
        revoke_session(refresh_token_str)

    return Response(status=status.HTTP_200_OK)


class TokenWebView(views.APIView):
    def post(self, request):
        user, error = get_user_from_credentials(
            request.data.get("email"), request.data.get("password")
        )

        if error:
            return error

        session = issue_session(user)
        response = Response(
            {
                "access_token": session["access_token"],
                "access_token_expiration_utc": session["access_token_expiration_utc"],
            }
        )
        set_refresh_token_cookie(response, session["refresh_token"])
        return response

    def delete(self, request):
        refresh_token_str = request.COOKIES.get(REFRESH_TOKEN_COOKIE_NAME)

        if refresh_token_str:
            revoke_session(refresh_token_str)

        response = Response(status=status.HTTP_200_OK)
        clear_refresh_token_cookie(response)
        return response
