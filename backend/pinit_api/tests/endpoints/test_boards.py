from rest_framework import status
from rest_framework.test import APITestCase
from ..testing_utils.factories import BoardFactory, PinFactory
from pinit_api.lib.constants import (
    ERROR_CODE_ACCOUNT_NOT_FOUND,
    ERROR_CODE_BOARD_NOT_FOUND,
)

NUMBER_PINS = 5


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
