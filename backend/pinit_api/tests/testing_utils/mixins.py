from rest_framework_simplejwt.tokens import RefreshToken


class JWTAuthenticationMixin:
    def authenticate_client(self, user):
        tokens_pair = RefreshToken.for_user(user)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens_pair.access_token}")
