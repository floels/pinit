from pinit_api.lib.utils.refresh_tokens import issue_refresh_token
from pinit_api.lib.constants import (
    ERROR_CODE_INVALID_REFRESH_TOKEN,
    ERROR_CODE_MISSING_REFRESH_TOKEN,
    REFRESH_TOKEN_COOKIE_NAME,
)
from rest_framework import status

from .test_authentication import AuthenticationTests


class RefreshTokenMobileTests(AuthenticationTests):
    def setUp(self):
        super().setUp()

        self.refresh_token = issue_refresh_token(self.user)

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

    def test_refresh_rotates_the_refresh_token(self):
        response = self.post(request_payload={"refresh_token": self.refresh_token})

        rotated_refresh_token = response.json()["refresh_token"]
        self.assertTrue(rotated_refresh_token)
        self.assertNotEqual(rotated_refresh_token, self.refresh_token)

    def test_old_refresh_token_is_rejected_after_rotation(self):
        self.post(request_payload={"refresh_token": self.refresh_token})

        response = self.post(request_payload={"refresh_token": self.refresh_token})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(
            response.json()["errors"],
            [{"code": ERROR_CODE_INVALID_REFRESH_TOKEN}],
        )

    def post(self, request_payload=None):
        return self.client.post(
            "/api/token/mobile/refresh/", request_payload, format="json"
        )

    def test_refresh_token_wrong_refresh_token(self):
        request_payload = {"refresh_token": "wrong-refresh-token"}

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


class RefreshTokenWebTests(AuthenticationTests):
    def setUp(self):
        super().setUp()
        self.refresh_token = issue_refresh_token(self.user)

    def post(self):
        self.client.cookies[REFRESH_TOKEN_COOKIE_NAME] = self.refresh_token
        return self.client.post("/api/token/web/refresh/")

    def test_web_refresh_token_happy_path(self):
        response = self.post()

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()
        self.assertTrue(response_data.get("access_token"))
        self.assertNotIn("refresh_token", response_data)
        self.check_access_token_expiration_utc(
            response_data["access_token_expiration_utc"]
        )

    def test_web_refresh_rotates_the_refresh_token_cookie(self):
        response = self.post()

        self.assertIn(REFRESH_TOKEN_COOKIE_NAME, response.cookies)
        rotated_cookie = response.cookies[REFRESH_TOKEN_COOKIE_NAME].value
        self.assertTrue(rotated_cookie)
        self.assertNotEqual(rotated_cookie, self.refresh_token)

    def test_old_refresh_cookie_is_rejected_after_rotation(self):
        self.post()

        # Re-present the original (now rotated-out) cookie.
        self.client.cookies[REFRESH_TOKEN_COOKIE_NAME] = self.refresh_token
        response = self.client.post("/api/token/web/refresh/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(
            response.json()["errors"],
            [{"code": ERROR_CODE_INVALID_REFRESH_TOKEN}],
        )

    def test_web_refresh_token_missing_cookie(self):
        response = self.client.post("/api/token/web/refresh/")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json()["errors"],
            [{"code": ERROR_CODE_MISSING_REFRESH_TOKEN}],
        )

    def test_web_refresh_token_invalid_cookie(self):
        self.client.cookies[REFRESH_TOKEN_COOKIE_NAME] = "wrong-refresh-token"
        response = self.client.post("/api/token/web/refresh/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(
            response.json()["errors"],
            [{"code": ERROR_CODE_INVALID_REFRESH_TOKEN}],
        )
