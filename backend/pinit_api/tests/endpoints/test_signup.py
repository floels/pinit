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


class SignupTests(TestCase):
    def setUp(self):
        self.new_user_email = "new.user@example.com"
        self.existing_user_email = "existing.user@example.com"
        self.existing_user_password = "Pa$$wOrd_existing_user"

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

    def check_response_happy_path(self, response):
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response_data = response.json()

        access_token = response_data["access_token"]
        assert bool(access_token)

        refresh_token = response_data["refresh_token"]
        assert bool(refresh_token)

        access_token_expiration_date = response_data["access_token_expiration_utc"]
        assert bool(access_token_expiration_date)

    def check_added_user_and_account(self):
        self.assertEqual(User.objects.count(), self.number_existing_users + 1)
        self.assertEqual(Account.objects.count(), self.number_existing_accounts + 1)

    def check_not_added_user_or_account(self):
        self.assertEqual(User.objects.count(), self.number_existing_users)
        self.assertEqual(Account.objects.count(), self.number_existing_accounts)

    def check_attributes_new_user(self):
        new_user = User.objects.get(email=self.new_user_email)
        self.assertEqual(str(new_user.birthdate), "1970-01-01")

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
        response = self.client.post("/api/signup/", request_payload, format="json")

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

        self.client.post("/api/signup/", request_payload, format="json")

        Account.objects.get(username="me1")

    def test_signup_invalid_email(self):
        request_payload = {
            "email": "new.user@example.",
            "password": "Pa$$w0rd_new_user",
            "birthdate": "1970-01-01",
        }

        response = self.client.post("/api/signup/", request_payload, format="json")

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
        response = self.client.post("/api/signup/", request_payload, format="json")

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

        response = self.client.post("/api/signup/", request_payload, format="json")

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

        response = self.client.post("/api/signup/", request_payload, format="json")

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

        response = self.client.post("/api/signup/", request_payload, format="json")

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

        response = self.client.post("/api/signup/", request_payload, format="json")

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

        response = self.client.post("/api/signup/", request_payload, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.check_response_error_code(
            response=response, error_code=ERROR_CODE_INVALID_BIRTHDATE
        )

        self.check_not_added_user_or_account()
