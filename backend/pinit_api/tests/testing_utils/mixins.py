from pinit_api.domain.auth.access_tokens import create_access_token


class AccessTokenAuthenticationMixin:
    def authenticate_client(self, user):
        access_token, _ = create_access_token(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")
