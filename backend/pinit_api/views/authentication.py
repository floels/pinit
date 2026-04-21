import pytz
from datetime import datetime
from rest_framework_simplejwt.views import (
    TokenViewBase,
)
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


@api_view(["POST"])
def obtain_token_pair(request):
    email = request.data.get("email")
    password = request.data.get("password")

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response(
            {"errors": [{"code": ERROR_CODE_INVALID_EMAIL}]},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    if not user.check_password(password):
        return Response(
            {"errors": [{"code": ERROR_CODE_INVALID_PASSWORD}]},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    tokens_data = get_tokens_data(user)

    return Response(tokens_data)


@api_view(["GET"])
def obtain_demo_token_pair(request):
    try:
        user = User.objects.get(email=DEMO_USER_EMAIL)
    except User.DoesNotExist:
        return Response(
            {"errors": [{"code": ERROR_CODE_INVALID_EMAIL}]},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    tokens_data = get_tokens_data(user)

    return Response(tokens_data)


# This view is taking inspiration from:
# https://github.com/jazzband/djangorestframework-simplejwt/blob/master/rest_framework_simplejwt/views.py#L63-L69
class RefreshTokenView(TokenViewBase):
    _serializer_class = (
        "pinit_api.serializers.token_serializers.CustomTokenRefreshSerializer"
    )

    def post(self, request):
        if "refresh_token" not in request.data:
            return Response(
                {"errors": [{"code": ERROR_CODE_MISSING_REFRESH_TOKEN}]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.get_serializer(
            data={"refresh": request.data["refresh_token"]}
        )

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
