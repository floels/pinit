from datetime import datetime, timezone
from django.test import TestCase
from django.utils.dateparse import parse_datetime
from django.conf import settings
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from pinit_api.models import User
from pinit_api.lib.constants import (
    ERROR_CODE_INVALID_EMAIL,
    ERROR_CODE_INVALID_PASSWORD,
)
from pinit_api.views.authentication import REFRESH_TOKEN_COOKIE_NAME


class AuthenticationTests(TestCase):
    def setUp(self):
        self.user_email = "existing.user@example.com"
        self.user_password = "Pa$$wOrd_existing_user"

        self.user = User.objects.create_user(
            email=self.user_email,
            password=self.user_password,
        )

    def check_access_token_expiration_utc(self, access_token_expiration_utc=""):
        parsed_expiration_utc = parse_datetime(access_token_expiration_utc)

        now_utc = datetime.now(timezone.utc)
        expected_lifetime = settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"]
        expected_expiration_utc = now_utc + expected_lifetime

        delta_actual_predicted_expiration_seconds = abs(
            ((parsed_expiration_utc - expected_expiration_utc)).total_seconds()
        )
        tolerance_seconds = 60
        self.assertLess(delta_actual_predicted_expiration_seconds, tolerance_seconds)

    def check_response_wrong_email(self, response=None):
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response_data = response.json()

        self.assertEqual(
            response_data["errors"],
            [{"code": ERROR_CODE_INVALID_EMAIL}],
        )

    def check_response_wrong_password(self, response=None):
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response_data = response.json()

        self.assertEqual(
            response_data["errors"],
            [{"code": ERROR_CODE_INVALID_PASSWORD}],
        )


class ObtainTokenMobileTests(AuthenticationTests):
    def test_obtain_token_happy_path(self):
        request_payload = {
            "email": self.user_email,
            "password": self.user_password,
        }

        response = self.post(request_payload=request_payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()

        self.check_response_data_happy_path(response_data=response_data)

    def post(self, request_payload=None):
        return self.client.post("/api/token/obtain/", request_payload, format="json")

    def check_response_data_happy_path(self, response_data=None):
        access_token = response_data["access_token"]
        assert bool(access_token)

        refresh_token = response_data["refresh_token"]
        assert bool(refresh_token)

        access_token_expiration_utc = response_data["access_token_expiration_utc"]
        self.check_access_token_expiration_utc(
            access_token_expiration_utc=access_token_expiration_utc
        )

    def test_obtain_token_wrong_email(self):
        request_payload = {"email": "wrong_email", "password": "somePa$$word"}

        response = self.post(request_payload=request_payload)

        self.check_response_wrong_email(response=response)

    def test_obtain_token_wrong_password(self):
        request_payload = {
            "email": self.user_email,
            "password": "somePa$$word",
        }

        response = self.post(request_payload=request_payload)

        self.check_response_wrong_password(response=response)


class ObtainDemoTokenMobileTests(AuthenticationTests):
    def setUp(self):
        User.objects.create_user(email="demo@pinit.com", password="Pa$$w0rd")

    def test_obtain_demo_token(self):
        response = self.client.get("/api/token/obtain-demo/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()

        self.assertTrue(response_data["access_token"])
        self.assertTrue(response_data["refresh_token"])


class ObtainTokenWebTests(AuthenticationTests):
    def post(self, request_payload=None):
        return self.client.post(
            "/api/token/web/obtain/", request_payload, format="json"
        )

    def test_obtain_token_happy_path(self):
        response = self.post(
            {"email": self.user_email, "password": self.user_password}
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()
        self.assertTrue(response_data.get("access_token"))
        self.assertNotIn("refresh_token", response_data)
        self.check_access_token_expiration_utc(
            response_data["access_token_expiration_utc"]
        )

        self.assertIn(REFRESH_TOKEN_COOKIE_NAME, response.cookies)
        self.assertTrue(response.cookies[REFRESH_TOKEN_COOKIE_NAME].value)

    def test_obtain_token_wrong_email(self):
        response = self.post({"email": "wrong_email", "password": "somePa$$word"})
        self.check_response_wrong_email(response=response)

    def test_obtain_token_wrong_password(self):
        response = self.post(
            {"email": self.user_email, "password": "somePa$$word"}
        )
        self.check_response_wrong_password(response=response)


class ObtainDemoTokenWebTests(AuthenticationTests):
    def setUp(self):
        User.objects.create_user(email="demo@pinit.com", password="Pa$$w0rd")

    def test_obtain_demo_token(self):
        response = self.client.get("/api/token/web/obtain-demo/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()
        self.assertTrue(response_data.get("access_token"))
        self.assertNotIn("refresh_token", response_data)

        self.assertIn(REFRESH_TOKEN_COOKIE_NAME, response.cookies)
        self.assertTrue(response.cookies[REFRESH_TOKEN_COOKIE_NAME].value)


class LogoutTests(AuthenticationTests):
    def setUp(self):
        super().setUp()
        self.refresh_token_object = RefreshToken.for_user(self.user)
        self.refresh_token_str = str(self.refresh_token_object)
        self.client.cookies[REFRESH_TOKEN_COOKIE_NAME] = self.refresh_token_str

    def test_logout_clears_refresh_token_cookie(self):
        response = self.client.post("/api/token/web/logout/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(REFRESH_TOKEN_COOKIE_NAME, response.cookies)
        self.assertEqual(response.cookies[REFRESH_TOKEN_COOKIE_NAME]["max-age"], 0)

    def test_logout_blacklists_refresh_token(self):
        self.client.post("/api/token/web/logout/")

        self.client.cookies[REFRESH_TOKEN_COOKIE_NAME] = self.refresh_token_str
        response = self.client.post("/api/token/web/refresh/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(
            response.json()["errors"],
            [{"code": "invalid_refresh_token"}],
        )

    def test_logout_with_no_cookie_succeeds(self):
        del self.client.cookies[REFRESH_TOKEN_COOKIE_NAME]
        response = self.client.post("/api/token/web/logout/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_logout_with_invalid_token_succeeds(self):
        self.client.cookies[REFRESH_TOKEN_COOKIE_NAME] = "invalid.token.value"
        response = self.client.post("/api/token/web/logout/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
