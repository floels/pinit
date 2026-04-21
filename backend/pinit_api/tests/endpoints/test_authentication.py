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
from pinit_api.views.authentication import (
    ERROR_CODE_INVALID_REFRESH_TOKEN,
    ERROR_CODE_MISSING_REFRESH_TOKEN,
)


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


class ObtainTokenTests(AuthenticationTests):
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

    def check_response_wrong_email(self, response=None):
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response_data = response.json()

        self.assertEqual(
            response_data["errors"],
            [{"code": ERROR_CODE_INVALID_EMAIL}],
        )

    def test_obtain_token_wrong_password(self):
        request_payload = {
            "email": self.user_email,
            "password": "somePa$$word",
        }

        response = self.post(request_payload=request_payload)

        self.check_response_wrong_password(response=response)

    def check_response_wrong_password(self, response=None):
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response_data = response.json()

        self.assertEqual(
            response_data["errors"],
            [{"code": ERROR_CODE_INVALID_PASSWORD}],
        )


class ObtainDemoTokenTests(AuthenticationTests):
    def setUp(self):
        User.objects.create_user(email="demo@pinit.com", password="Pa$$w0rd")

    def test_obtain_demo_token(self):
        response = self.client.get("/api/token/obtain-demo/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()

        self.assertTrue(response_data["access_token"])
        self.assertTrue(response_data["refresh_token"])


class RefreshTokenTests(AuthenticationTests):
    def setUp(self):
        super().setUp()

        refresh_token_object = RefreshToken.for_user(self.user)

        self.refresh_token = str(refresh_token_object)

    def test_refresh_token_happy_path(self):
        request_payload = {"refresh_token": self.refresh_token}

        response = self.post(request_payload=request_payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()

        self.check_response_data_happy_path(response_data=response_data)

    def check_response_data_happy_path(self, response_data=None):
        refreshed_access_token = response_data["access_token"]
        self.assertTrue(refreshed_access_token)

        access_token_expiration_utc = response_data["access_token_expiration_utc"]

        self.check_access_token_expiration_utc(access_token_expiration_utc)

    def post(self, request_payload=None):
        return self.client.post("/api/token/refresh/", request_payload, format="json")

    def test_refresh_token_wrong_refresh_token(self):
        request_payload = {"refresh_token": "wrong.refresh.token"}

        response = self.post(request_payload=request_payload)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response_data = response.json()

        self.assertEqual(
            response_data["errors"],
            [{"code": ERROR_CODE_INVALID_REFRESH_TOKEN}],
        )

    def test_refresh_token_missing_refresh_token(self):
        response = self.post(request_payload={})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response_data = response.json()

        self.assertEqual(
            response_data["errors"],
            [{"code": ERROR_CODE_MISSING_REFRESH_TOKEN}],
        )
