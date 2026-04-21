import pytz
from datetime import datetime
from rest_framework_simplejwt.tokens import RefreshToken


def get_tokens_data(user=None):
    refresh_token = RefreshToken.for_user(user)

    access_token = refresh_token.access_token

    access_token_expiration_utc = datetime.fromtimestamp(
        access_token["exp"], tz=pytz.UTC
    )

    return {
        "access_token": str(access_token),
        "access_token_expiration_utc": access_token_expiration_utc.isoformat(),
        "refresh_token": str(refresh_token),
    }
