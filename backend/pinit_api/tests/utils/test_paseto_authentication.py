from django.test import TestCase
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.test import APIRequestFactory

from pinit_api.models import User
from pinit_api.lib.authentication import PasetoAuthentication
from pinit_api.lib.utils.tokens import create_access_token


class PasetoAuthenticationTests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.auth = PasetoAuthentication()
        self.user = User.objects.create_user(
            email="auth.user@example.com", password="Pa$$wOrd_auth"
        )

    def _request_with_authorization(self, header_value):
        return self.factory.get("/", HTTP_AUTHORIZATION=header_value)

    def test_no_authorization_header_returns_none(self):
        request = self.factory.get("/")
        self.assertIsNone(self.auth.authenticate(request))

    def test_non_bearer_scheme_returns_none(self):
        request = self._request_with_authorization("Basic something")
        self.assertIsNone(self.auth.authenticate(request))

    def test_valid_token_authenticates_the_user(self):
        token, _ = create_access_token(self.user)
        request = self._request_with_authorization(f"Bearer {token}")

        user, returned_token = self.auth.authenticate(request)

        self.assertEqual(user, self.user)
        self.assertEqual(returned_token, token)

    def test_tampered_token_is_rejected(self):
        token, _ = create_access_token(self.user)
        request = self._request_with_authorization(f"Bearer {token[:-4]}AAAA")

        with self.assertRaises(AuthenticationFailed):
            self.auth.authenticate(request)

    def test_bearer_without_token_is_rejected(self):
        request = self._request_with_authorization("Bearer")

        with self.assertRaises(AuthenticationFailed):
            self.auth.authenticate(request)

    def test_token_for_deleted_user_is_rejected(self):
        token, _ = create_access_token(self.user)
        self.user.delete()
        request = self._request_with_authorization(f"Bearer {token}")

        with self.assertRaises(AuthenticationFailed):
            self.auth.authenticate(request)

    def test_authenticate_header_present_so_failures_are_401(self):
        request = self.factory.get("/")
        self.assertIsNotNone(self.auth.authenticate_header(request))
