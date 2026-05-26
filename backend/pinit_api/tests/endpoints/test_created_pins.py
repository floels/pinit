from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.conf import settings

from ..testing_utils import PinFactory, AccountFactory
from pinit_api.lib.constants import (
    ERROR_CODE_FORBIDDEN,
    ERROR_CODE_PIN_NOT_FOUND,
    ERROR_CODE_ACCOUNT_NOT_FOUND,
)

NUMBER_PINS = 5
PAGINATION_PAGE_SIZE = settings.REST_FRAMEWORK["PAGE_SIZE"]


class GetCreatedPinsTests(APITestCase):
    def setUp(self):
        self.account = AccountFactory(custom_username="testuser")
        self.pins = PinFactory.create_batch(NUMBER_PINS, author=self.account)
        self.other_account = AccountFactory()
        self.other_pins = PinFactory.create_batch(3, author=self.other_account)

        self.client = APIClient()

    def get(self, username="testuser", page=None):
        url = f"/api/accounts/{username}/pins/"
        if page is not None:
            url += f"?page={page}"
        return self.client.get(url)

    def test_get_created_pins_happy_path(self):
        response = self.get(username="testuser")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()
        self.assertIn("results", response_data)

        results = response_data["results"]
        self.assertEqual(len(results), NUMBER_PINS)

        # Each pin should have the right structure
        for pin_data in results:
            self.assertIn("unique_id", pin_data)
            self.assertIn("image_url", pin_data)
            self.assertIn("title", pin_data)
            self.assertIn("description", pin_data)
            self.assertIn("author", pin_data)
            self.assertEqual(pin_data["author"]["username"], "testuser")

    def test_get_created_pins_only_returns_pins_of_given_user(self):
        response = self.get(username="testuser")

        response_data = response.json()
        results = response_data["results"]

        # Only testuser's pins should be returned (not other_account's)
        returned_ids = {pin["unique_id"] for pin in results}
        own_ids = {str(pin.unique_id) for pin in self.pins}
        other_ids = {str(pin.unique_id) for pin in self.other_pins}

        self.assertTrue(returned_ids.issubset(own_ids | other_ids))
        self.assertFalse(returned_ids & other_ids)

    def test_get_created_pins_account_not_found(self):
        response = self.get(username="nonexistentuser")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_created_pins_empty(self):
        empty_account = AccountFactory(custom_username="emptyuser")

        response = self.get(username="emptyuser")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()
        self.assertEqual(response_data["results"], [])

    def test_get_created_pins_pagination(self):
        # Create enough pins to paginate
        extra_account = AccountFactory(custom_username="biguser")
        PinFactory.create_batch(PAGINATION_PAGE_SIZE + 5, author=extra_account)

        response = self.get(username="biguser", page=1)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()
        self.assertEqual(len(response_data["results"]), PAGINATION_PAGE_SIZE)
        self.assertIsNotNone(response_data.get("next"))

    def check_pin_data(self, pin_data, pin):
        self.assertEqual(pin_data["unique_id"], pin.unique_id)
        self.assertEqual(pin_data["image_url"], pin.image_url)
        self.assertEqual(pin_data["title"], pin.title)
        self.assertEqual(pin_data["description"], pin.description)


class UpdatePinTests(APITestCase):
    def setUp(self):
        self.account = AccountFactory()
        self.pin = PinFactory(author=self.account)
        self.other_account = AccountFactory()
        self.other_pin = PinFactory(author=self.other_account)

        self.client = APIClient()
        self.client.force_authenticate(user=self.account.owner)

    def patch(self, unique_id, data=None):
        return self.client.patch(
            f"/api/pins/{unique_id}/", data or {}, format="json"
        )

    def test_update_pin_happy_path(self):
        new_title = "Updated title"
        new_description = "Updated description"

        response = self.patch(
            unique_id=self.pin.unique_id,
            data={"title": new_title, "description": new_description},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()
        self.assertEqual(response_data["title"], new_title)
        self.assertEqual(response_data["description"], new_description)
        self.assertEqual(response_data["unique_id"], self.pin.unique_id)

        self.pin.refresh_from_db()
        self.assertEqual(self.pin.title, new_title)
        self.assertEqual(self.pin.description, new_description)

    def test_update_pin_only_title(self):
        original_description = self.pin.description
        new_title = "New title only"

        response = self.patch(
            unique_id=self.pin.unique_id,
            data={"title": new_title},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.pin.refresh_from_db()
        self.assertEqual(self.pin.title, new_title)
        self.assertEqual(self.pin.description, original_description)

    def test_update_pin_set_title_null(self):
        response = self.patch(
            unique_id=self.pin.unique_id,
            data={"title": None},
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.pin.refresh_from_db()
        self.assertIsNone(self.pin.title)

    def test_update_pin_not_found(self):
        response = self.patch(unique_id="000000000000000000")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        response_data = response.json()
        self.assertEqual(
            response_data["errors"], [{"code": ERROR_CODE_PIN_NOT_FOUND}]
        )

    def test_update_pin_not_author(self):
        response = self.patch(
            unique_id=self.other_pin.unique_id,
            data={"title": "New title"},
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response_data = response.json()
        self.assertEqual(
            response_data["errors"], [{"code": ERROR_CODE_FORBIDDEN}]
        )

    def test_update_pin_unauthenticated(self):
        self.client.force_authenticate(user=None)

        response = self.patch(
            unique_id=self.pin.unique_id,
            data={"title": "New title"},
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class DeletePinTests(APITestCase):
    def setUp(self):
        self.account = AccountFactory()
        self.pin = PinFactory(author=self.account)
        self.other_account = AccountFactory()
        self.other_pin = PinFactory(author=self.other_account)

        self.client = APIClient()
        self.client.force_authenticate(user=self.account.owner)

    def delete(self, unique_id):
        return self.client.delete(f"/api/pins/{unique_id}/")

    def test_delete_pin_happy_path(self):
        pin_id = self.pin.unique_id

        response = self.delete(unique_id=pin_id)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)

        from pinit_api.models import Pin
        self.assertFalse(Pin.objects.filter(unique_id=pin_id).exists())

    def test_delete_pin_not_found(self):
        response = self.delete(unique_id="000000000000000000")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        response_data = response.json()
        self.assertEqual(
            response_data["errors"], [{"code": ERROR_CODE_PIN_NOT_FOUND}]
        )

    def test_delete_pin_not_author(self):
        response = self.delete(unique_id=self.other_pin.unique_id)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response_data = response.json()
        self.assertEqual(
            response_data["errors"], [{"code": ERROR_CODE_FORBIDDEN}]
        )

    def test_delete_pin_unauthenticated(self):
        self.client.force_authenticate(user=None)

        response = self.delete(unique_id=self.pin.unique_id)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
