from django.test import TestCase
from rest_framework import status
from pinit_api.models import User, Account
from pinit_api.lib.constants import (
    ERROR_CODE_INVALID_EMAIL,
    ERROR_CODE_INVALID_PASSWORD,
)
from pinit_api.serializers.user_serializers import (
    ERROR_CODE_EMAIL_ALREADY_SIGNED_UP,
    ERROR_CODE_INVALID_BIRTHDATE,
)
from pinit_api.tests.testing_utils.factories import AccountFactory
from pinit_api.lib.constants import REFRESH_TOKEN_COOKIE_NAME


class SignupTestsMixin:
    new_user_email = "new.user@example.com"
    existing_user_email = "existing.user@example.com"
    existing_user_password = "Pa$$wOrd_existing_user"

    def setUp(self):
        self.existing_user = User.objects.create_user(
            email=self.existing_user_email,
            password=self.existing_user_password,
        )

        # Existing accounts with "newuser", "newuser1" and "newuser2" usernames
        # (to test suffix incrementation logic):
        AccountFactory.create(custom_username="newuser")
        AccountFactory.create(custom_username="newuser1")
        AccountFactory.create(custom_username="newuser2")

        self.number_existing_accounts = Account.objects.count()
        self.number_existing_users = User.objects.count()

    def post(self, request_payload):
        raise NotImplementedError

    def check_response_happy_path(self, response):
        raise NotImplementedError

    def check_added_user_and_account(self):
        self.assertEqual(User.objects.count(), self.number_existing_users + 1)
        self.assertEqual(Account.objects.count(), self.number_existing_accounts + 1)

    def check_not_added_user_or_account(self):
        self.assertEqual(User.objects.count(), self.number_existing_users)
        self.assertEqual(Account.objects.count(), self.number_existing_accounts)

    def check_attributes_new_user(self):
        new_user = User.objects.get(email=self.new_user_email)
        self.assertEqual(str(new_user.birthdate), "1970-01-01")
        self.assertTrue(new_user.check_password("Pa$$w0rd_new_user"))

    def check_attributes_new_account(self):
        new_account = Account.objects.get(owner__email=self.new_user_email)

        self.assertEqual(new_account.type, "personal")
        self.assertEqual(new_account.username, "newuser3")
        self.assertEqual(new_account.initial, "N")
        self.assertEqual(new_account.first_name, "New")
        self.assertEqual(new_account.last_name, "User")
        self.assertEqual(new_account.business_name, None)

    def check_response_error_code(self, response=None, error_code=""):
        response_data = response.json()

        self.assertEqual(
            response_data["errors"],
            [{"code": error_code}],
        )

    def test_signup_happy_path(self):
        request_payload = {
            "email": self.new_user_email,
            "password": "Pa$$w0rd_new_user",
            "birthdate": "1970-01-01",
        }
        response = self.post(request_payload)

        self.check_response_happy_path(response)
        self.check_added_user_and_account()
        self.check_attributes_new_user()
        self.check_attributes_new_account()

    def test_signup_forbidden_username(self):
        request_payload = {
            "email": "me@example.com",  # yields "me" as default username, which is forbidden
            "password": "Pa$$w0rd_new_user",
            "birthdate": "1970-01-01",
        }

        self.post(request_payload)

        Account.objects.get(username="me1")

    def test_signup_invalid_email(self):
        request_payload = {
            "email": "new.user@example.",
            "password": "Pa$$w0rd_new_user",
            "birthdate": "1970-01-01",
        }

        response = self.post(request_payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.check_response_error_code(
            response=response, error_code=ERROR_CODE_INVALID_EMAIL
        )
        self.check_not_added_user_or_account()

    def test_signup_blank_email(self):
        request_payload = {
            "email": "",
            "password": "Pa$$w0rd_new_user",
            "birthdate": "1970-01-01",
        }

        response = self.post(request_payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.check_response_error_code(
            response=response, error_code=ERROR_CODE_INVALID_EMAIL
        )
        self.check_not_added_user_or_account()

    def test_signup_email_already_signed_up(self):
        request_payload = {
            "email": self.existing_user_email,
            "password": "Pa$$w0rd_new_user",
            "birthdate": "1970-01-01",
        }

        response = self.post(request_payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.check_response_error_code(
            response=response, error_code=ERROR_CODE_EMAIL_ALREADY_SIGNED_UP
        )
        self.check_not_added_user_or_account()

    def test_signup_invalid_password(self):
        request_payload = {
            "email": "new.user@example.com",
            "password": "abc",
            "birthdate": "1970-01-01",
        }

        response = self.post(request_payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.check_response_error_code(
            response=response, error_code=ERROR_CODE_INVALID_PASSWORD
        )
        self.check_not_added_user_or_account()

    def test_signup_blank_password(self):
        request_payload = {
            "email": "new.user@example.com",
            "password": "",
            "birthdate": "1970-01-01",
        }

        response = self.post(request_payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.check_response_error_code(
            response=response, error_code=ERROR_CODE_INVALID_PASSWORD
        )
        self.check_not_added_user_or_account()

    def test_signup_invalid_birthdate(self):
        request_payload = {
            "email": "new.user@example.com",
            "password": "Pa$$w0rd_new_user",
            "birthdate": "1970-13-01",
        }

        response = self.post(request_payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.check_response_error_code(
            response=response, error_code=ERROR_CODE_INVALID_BIRTHDATE
        )
        self.check_not_added_user_or_account()

    def test_signup_blank_birthdate(self):
        request_payload = {
            "email": "new.user@example.com",
            "password": "Pa$$w0rd_new_user",
            "birthdate": "",
        }

        response = self.post(request_payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.check_response_error_code(
            response=response, error_code=ERROR_CODE_INVALID_BIRTHDATE
        )
        self.check_not_added_user_or_account()


class SignupMobileTests(SignupTestsMixin, TestCase):
    def post(self, request_payload):
        return self.client.post(
            "/api/accounts/mobile/", request_payload, format="json"
        )

    def check_response_happy_path(self, response):
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response_data = response.json()

        self.assertTrue(response_data.get("access_token"))
        self.assertTrue(response_data.get("refresh_token"))
        self.assertTrue(response_data.get("access_token_expiration_utc"))


class SignupWebTests(SignupTestsMixin, TestCase):
    def post(self, request_payload):
        return self.client.post("/api/accounts/web/", request_payload, format="json")

    def check_response_happy_path(self, response):
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response_data = response.json()
        self.assertTrue(response_data.get("access_token"))
        self.assertNotIn("refresh_token", response_data)
        self.assertTrue(response_data.get("access_token_expiration_utc"))

        self.assertIn(REFRESH_TOKEN_COOKIE_NAME, response.cookies)
        self.assertTrue(response.cookies[REFRESH_TOKEN_COOKIE_NAME].value)
