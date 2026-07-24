from pinit_api.lib.utils.tokens import create_access_token


class AccessTokenAuthenticationMixin:
    def authenticate_client(self, user):
        access_token, _ = create_access_token(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
