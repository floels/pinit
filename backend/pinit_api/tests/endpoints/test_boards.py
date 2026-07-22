from unittest.mock import patch

from django.db import IntegrityError
from rest_framework import status
from rest_framework.test import APITestCase
from ..testing_utils.factories import AccountFactory, BoardFactory, PinFactory
from pinit_api.models import Board
from pinit_api.lib.constants import (
    ERROR_CODE_ACCOUNT_NOT_FOUND,
    ERROR_CODE_BOARD_NOT_FOUND,
    ERROR_CODE_BOARD_NAME_REQUIRED,
    ERROR_CODE_PIN_NOT_FOUND,
)

NUMBER_PINS = 5


class CreateBoardViewTests(APITestCase):
    def setUp(self):
        self.account = AccountFactory()
        self.pin = PinFactory()
        self.client.force_authenticate(user=self.account.owner)

    def post(self, payload=None):
        return self.client.post("/api/boards/", payload, format="json")

    def test_happy_path_with_pin(self):
        response = self.post({"name": "My Travel Board", "pin_id": self.pin.unique_id})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertEqual(data["name"], "My Travel Board")
        self.assertEqual(data["slug"], "my-travel-board")
        self.assertIn("unique_id", data)

        board = Board.objects.get(unique_id=data["unique_id"])
        self.assertIn(self.pin, board.pins.all())

    def test_happy_path_without_pin(self):
        response = self.post({"name": "Empty Board"})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        data = response.json()
        self.assertEqual(data["name"], "Empty Board")
        self.assertEqual(data["slug"], "empty-board")

    def test_missing_name_returns_400(self):
        response = self.post({"pin_id": self.pin.unique_id})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json(), {"errors": [{"code": ERROR_CODE_BOARD_NAME_REQUIRED}]}
        )

    def test_blank_name_returns_400(self):
        response = self.post({"name": "   "})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json(), {"errors": [{"code": ERROR_CODE_BOARD_NAME_REQUIRED}]}
        )

    def test_slug_conflict_auto_suffixed(self):
        BoardFactory(author=self.account, name="My Board", slug="my-board")

        response = self.post({"name": "My Board"})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()["slug"], "my-board-2")

    def test_slug_conflict_auto_suffixed_multiple_times(self):
        BoardFactory(author=self.account, name="My Board", slug="my-board")
        BoardFactory(author=self.account, name="My Board 2", slug="my-board-2")

        response = self.post({"name": "My Board"})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()["slug"], "my-board-3")

    def test_slug_collision_race_is_retried(self):
        # Simulate a concurrent request winning the slug between the
        # uniqueness check and the create() call: the first insert is rejected
        # by the DB unique constraint, the view must retry rather than 500.
        real_create = Board.objects.create
        slugs_attempted = []

        def flaky_create(*args, **kwargs):
            slugs_attempted.append(kwargs.get("slug"))
            if len(slugs_attempted) == 1:
                raise IntegrityError("duplicate key value violates unique constraint")
            return real_create(*args, **kwargs)

        with patch.object(Board.objects, "create", side_effect=flaky_create):
            response = self.post({"name": "My Board"})

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(slugs_attempted), 2)
        self.assertEqual(response.json()["slug"], "my-board")

    def test_persistent_slug_collision_does_not_loop_forever(self):
        with patch.object(
            Board.objects, "create", side_effect=IntegrityError("duplicate")
        ) as mock_create:
            with self.assertRaises(IntegrityError):
                self.post({"name": "My Board"})

        # Retried at least once, then gave up (bounded loop, no infinite retry).
        self.assertGreater(mock_create.call_count, 1)

    def test_board_not_persisted_when_pin_attach_fails(self):
        # If a write partway through board creation fails, the board must not
        # be left half-created.
        with patch(
            "pinit_api.views.boards.timezone.now", side_effect=RuntimeError("boom")
        ):
            with self.assertRaises(RuntimeError):
                self.post({"name": "My Board", "pin_id": self.pin.unique_id})

        self.assertFalse(Board.objects.filter(name="My Board").exists())

    def test_nonexistent_pin_returns_404(self):
        response = self.post({"name": "My Board", "pin_id": "000000000000000"})

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(
            response.json(), {"errors": [{"code": ERROR_CODE_PIN_NOT_FOUND}]}
        )

    def test_unauthenticated_returns_401(self):
        self.client.force_authenticate(user=None)
        response = self.post({"name": "My Board"})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class GetBoardDetailsViewTests(APITestCase):
    def setUp(self):
        self.board = BoardFactory()

        self.author = self.board.author

        self.pins = PinFactory.create_batch(NUMBER_PINS)

        for pin in self.pins:
            self.board.pins.add(pin)

    def test_happy_path(self):
        response = self.get(username=self.author.username, slug=self.board.slug)

        self.check_response_happy_path(response)

    def get(self, username="", slug=""):
        return self.client.get(f"/api/boards/{username}/{slug}/")

    def check_response_happy_path(self, response=None):
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()

        self.check_response_data_happy_path(response_data)

    def check_response_data_happy_path(self, response_data=None):
        self.assertEqual(len(response_data), 5)

        self.assertEqual(response_data["unique_id"], self.board.unique_id)
        self.assertEqual(response_data["name"], self.board.name)
        self.assertEqual(response_data["slug"], self.board.slug)

        author_data = response_data["author"]
        self.check_author_data(author_data=author_data)

        pins_data = response_data["pins"]
        self.check_pins_data(pins_data=pins_data)

    def check_author_data(self, author_data=None):
        self.assertEqual(len(author_data), 4)

        self.assertEqual(author_data["username"], self.author.username)
        self.assertEqual(author_data["display_name"], self.author.display_name)
        self.assertEqual(author_data["initial"], self.author.initial)
        self.assertEqual(
            author_data["profile_picture_url"], self.author.profile_picture_url
        )

    def check_pins_data(self, pins_data=None):
        self.assertEqual(len(pins_data), NUMBER_PINS)

        ordered_pins = self.pins[::-1]  # reverse the self.pins least
        # to get the pin most recently saved first

        for pin_data, pin in zip(pins_data, ordered_pins):
            self.check_pin_data(pin_data=pin_data, pin=pin)

    def check_pin_data(self, pin_data=None, pin=None):
        self.assertEqual(len(pin_data), 4)

        self.assertEqual(pin_data["unique_id"], pin.unique_id)
        self.assertEqual(pin_data["image_url"], pin.image_url)
        self.assertEqual(pin_data["title"], pin.title)

        pin_author_data = pin_data["author"]
        self.check_pin_author_data(
            pin_author_data=pin_author_data, pin_author=pin.author
        )

    def check_pin_author_data(self, pin_author_data=None, pin_author=None):
        self.assertEqual(len(pin_author_data), 4)

        self.assertEqual(pin_author_data["username"], pin_author.username)
        self.assertEqual(pin_author_data["display_name"], pin_author.display_name)
        self.assertEqual(pin_author_data["initial"], pin_author.initial)
        self.assertEqual(
            pin_author_data["profile_picture_url"], pin_author.profile_picture_url
        )

    def test_inexistent_board(self):
        response = self.get(username=self.author.username, slug="inexistent-board")

        self.check_response_board_not_found(response=response)

    def check_response_board_not_found(self, response=None):
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        response_data = response.json()

        self.assertEqual(
            response_data, {"errors": [{"code": ERROR_CODE_BOARD_NOT_FOUND}]}
        )

    def test_inexistent_account(self):
        response = self.get(username="inexistent-account", slug=self.board.slug)

        self.check_response_account_not_found(response=response)

    def check_response_account_not_found(self, response=None):
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        response_data = response.json()

        self.assertEqual(
            response_data, {"errors": [{"code": ERROR_CODE_ACCOUNT_NOT_FOUND}]}
        )
