from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

from pinit_api.models import Pin
from ..testing_utils import PinFactory, BoardFactory
from pinit_api.lib.constants import (
    ERROR_CODE_PIN_NOT_FOUND,
    ERROR_CODE_BOARD_NOT_FOUND,
    ERROR_CODE_FORBIDDEN,
)

NUMBER_EXISTING_PINS = 150
PAGINATION_PAGE_SIZE = settings.REST_FRAMEWORK["PAGE_SIZE"]


class GetPinDetailsTests(APITestCase):
    def setUp(self):
        self.pins = PinFactory.create_batch(NUMBER_EXISTING_PINS)

        self.pin = self.pins[0]

        self.client = APIClient()

    def test_get_pin_details_happy_path(self):
        response = self.get(unique_id=self.pin.unique_id)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()

    def get(self, unique_id=""):
        return self.client.get(f"/api/pins/{unique_id}/")

    def check_response_data_against_pin_object(self, response_data=None, pin=None):
        self.assertEqual(len(response_data), 5)

        self.assertEqual(response_data["unique_id"], pin.unique_id)
        self.assertEqual(response_data["image_url"], pin.image_url)
        self.assertEqual(response_data["title"], pin.title)
        self.assertEqual(response_data["description"], pin.description)

        author_data = response_data["author"]

        self.check_author_data_against_account_object(
            author_data=author_data, account=pin.author
        )

    def check_author_data_against_account_object(self, author_data=None, account=None):
        self.assertEqual(len(author_data), 4)

        self.assertEqual(author_data["username"], account.username)
        self.assertEqual(author_data["display_name"], account.display_name)
        self.assertEqual(author_data["initial"], account.initial)
        self.assertEqual(
            author_data["profile_picture_url"],
            account.profile_picture_url,
        )

    def test_get_pin_details_not_exists(self):
        non_existing_unique_id = self.get_non_existing_unique_id()

        response = self.get(unique_id=non_existing_unique_id)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def get_non_existing_unique_id(self):
        tentative_non_existing_unique_id = 100_000_000_000_000_000

        while Pin.objects.filter(unique_id=tentative_non_existing_unique_id).exists():
            tentative_non_existing_unique_id += 1

        return tentative_non_existing_unique_id


class SavePinTests(APITestCase):
    def setUp(self):
        self.board = BoardFactory()

        self.pin_already_saved = PinFactory()
        self.board.pins.add(self.pin_already_saved)

        self.pin_to_save = PinFactory()

        self.board_not_owned = BoardFactory()

        self.client = APIClient()
        self.client.force_authenticate(user=self.board.author.owner)

    def post(self, request_payload=None):
        return self.client.post("/api/save-pin/", request_payload, format="json")

    def check_board_last_pin_added_at(self, board=None):
        board.refresh_from_db()

        self.assertAlmostEqual(
            board.last_pin_added_at,
            timezone.now(),
            delta=timedelta(seconds=1),
        )

    def check_pin_save_last_saved_at(self, pin_save=None):
        self.assertAlmostEqual(
            pin_save.last_saved_at,
            timezone.now(),
            delta=timedelta(seconds=1),
        )

    def test_save_pin_happy_path(self):
        request_payload = {
            "pin_id": self.pin_to_save.unique_id,
            "board_id": self.board.unique_id,
        }

        response = self.post(request_payload=request_payload)

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(self.board.pins.count(), 2)

        created_pin_in_board = self.board.pins_in_board.order_by(
            "-last_saved_at"
        ).first()

        self.check_board_last_pin_added_at(board=self.board)

        self.check_pin_save_last_saved_at(created_pin_in_board)

    def test_save_pin_already_saved(self):
        request_payload = {
            "pin_id": self.pin_already_saved.unique_id,
            "board_id": self.board.unique_id,
        }

        response = self.post(request_payload=request_payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(self.board.pins.count(), 1)

        self.check_board_last_pin_added_at(self.board)

        self.check_pin_save_last_saved_at(self.board.pins_in_board.first())

    def test_save_pin_doesnt_exist(self):
        non_existing_pin_id = 100_000_000_000_000_000

        request_payload = {
            "pin_id": non_existing_pin_id,
            "board_id": self.board.unique_id,
        }

        response = self.post(request_payload=request_payload)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        response_data = response.json()

        self.assertEqual(response_data["errors"], [{"code": ERROR_CODE_PIN_NOT_FOUND}])

        self.assertEqual(self.board.pins.count(), 1)

    def test_save_board_doesnt_exist(self):
        non_existing_board_id = 100_000_000_000_000

        request_payload = {
            "pin_id": self.pin_to_save.unique_id,
            "board_id": non_existing_board_id,
        }

        response = self.post(request_payload=request_payload)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        response_data = response.json()

        self.assertEqual(
            response_data["errors"], [{"code": ERROR_CODE_BOARD_NOT_FOUND}]
        )

        self.assertEqual(self.board.pins.count(), 1)

    def test_save_board_not_owned(self):
        request_payload = {
            "pin_id": self.pin_to_save.unique_id,
            "board_id": self.board_not_owned.unique_id,
        }

        response = self.post(request_payload=request_payload)

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        response_data = response.json()

        self.assertEqual(response_data["errors"], [{"code": ERROR_CODE_FORBIDDEN}])

        self.assertEqual(self.board.pins.count(), 1)
