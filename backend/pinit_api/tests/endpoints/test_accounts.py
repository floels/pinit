from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from ..testing_utils import AccountFactory, BoardFactory, PinFactory
from pinit_api.lib.constants import ERROR_CODE_UNAUTHORIZED
from pinit_api.serializers.board_serializers import NUMBER_FIRST_IMAGES


class AccountsTestCase(APITestCase):
    def setUp(self):
        self.account = AccountFactory()

        self.client = APIClient()

        self.user = self.account.owner

        self.boards = BoardFactory.create_batch(3, author=self.account)

        self.pins_first_board = PinFactory.create_batch(5)

        for pin in self.pins_first_board:
            self.boards[0].pins.add(pin)

    def check_response_data_against_account_public_details(
        self, response_data=None, account=None, includes_private_details=False
    ):
        self.assertEqual(len(response_data), 9 if includes_private_details else 7)

        self.assertEqual(response_data["username"], account.username)
        self.assertEqual(response_data["display_name"], account.display_name)
        self.assertEqual(
            response_data["profile_picture_url"], account.profile_picture_url
        )
        self.assertEqual(
            response_data["background_picture_url"], account.background_picture_url
        )
        self.assertEqual(response_data["description"], account.description)
        self.assertEqual(response_data["initial"], account.initial)

        boards_data = response_data["boards"]

        self.check_boards_data_against_boards_list(boards_data=boards_data)

    def check_boards_data_against_boards_list(self, boards_data=None):
        board_first_image_urls = lambda board: [
            pin_in_board.pin.image_url
            for pin_in_board in board.pins_in_board.order_by("last_saved_at")[
                :NUMBER_FIRST_IMAGES
            ]
        ]

        self.assertEqual(
            boards_data,
            [
                {
                    "unique_id": board.unique_id,
                    "name": board.name,
                    "slug": board.slug,
                    "first_image_urls": board_first_image_urls(board),
                }
                for board in self.account.boards.order_by(
                    "-last_pin_added_at", "-created_at"
                )
            ],
        )


class GetAccountPublicDetailsTests(AccountsTestCase):
    def test_get_account_details_happy_path(self):
        response = self.get(username=self.account.username)

        self.check_response_happy_path(response=response)

    def get(self, username=""):
        return self.client.get(f"/api/accounts/{username}/")

    def check_response_happy_path(self, response=None):
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()

        self.check_response_data_against_account_public_details(
            response_data=response_data, account=self.account
        )

    def test_get_account_details_not_found(self):
        response = self.get(username="non_existing_username")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class GetMyAccountDetailsTests(AccountsTestCase):
    def test_happy_path(self):
        response = self.get()

        self.check_response_happy_path(response=response)

    def get(self, with_authentication=True):
        if with_authentication:
            self.client.force_authenticate(self.user)

        return self.client.get(f"/api/accounts/me/")

    def check_response_happy_path(self, response=None):
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()

        self.check_response_data_against_account_private_details(
            response_data=response_data, account=self.account
        )

    def check_response_data_against_account_private_details(
        self, response_data=None, account=None
    ):
        self.check_response_data_against_account_public_details(
            response_data=response_data, account=account, includes_private_details=True
        )

        self.assertEqual(response_data["type"], account.type)

        self.assertEqual(response_data["owner_email"], account.owner.email)

    def test_unauthenticated(self):
        response = self.get(with_authentication=False)

        self.check_response_unauthenticated(response=response)

    def check_response_unauthenticated(self, response=None):
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        response_data = response.json()

        self.assertEqual(response_data, {"errors": [{"code": ERROR_CODE_UNAUTHORIZED}]})
