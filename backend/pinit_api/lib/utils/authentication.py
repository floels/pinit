from pinit_api.lib.utils.tokens import create_access_token
from pinit_api.lib.utils.refresh_tokens import issue_refresh_token


def get_tokens_data(user):
    access_token, access_token_expiration_utc = create_access_token(user)
    refresh_token = issue_refresh_token(user)

    return {
        "access_token": access_token,
        "access_token_expiration_utc": access_token_expiration_utc.isoformat(),
        "refresh_token": refresh_token,
    }
