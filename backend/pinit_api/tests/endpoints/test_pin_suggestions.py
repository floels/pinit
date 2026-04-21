from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.conf import settings

from pinit_api.models import Pin
from ..testing_utils import UserFactory, PinFactory, JWTAuthenticationMixin

NUMBER_EXISTING_PINS = 150
PAGINATION_PAGE_SIZE = settings.REST_FRAMEWORK["PAGE_SIZE"]


class GetPinSuggestionsTests(APITestCase, JWTAuthenticationMixin):
    def setUp(self):
        self.pins = PinFactory.create_batch(NUMBER_EXISTING_PINS)

        self.user = UserFactory()

        self.client = APIClient()
        self.authenticate_client(self.user)

    def test_get_pin_suggestions_first_page(self):
        response = self.get(page=1)

        self.check_response_first_page(response=response)

    def get(self, page=1):
        return self.client.get("/api/pin-suggestions/", {"page": page})

    def check_response_first_page(self, response=None):
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()

        self.assertEqual(response_data["count"], NUMBER_EXISTING_PINS)

        self.check_first_item_response_first_page(response_data=response_data)

    def check_first_item_response_first_page(self, response_data=None):
        first_response_item = response_data["results"][0]

        most_recent_pin = Pin.objects.latest("created_at")

        self.check_response_item_against_pin_object(
            response_item=first_response_item, pin=most_recent_pin
        )

    def check_response_item_against_pin_object(self, response_item=None, pin=None):
        self.assertEqual(len(response_item), 4)

        self.assertEqual(response_item["unique_id"], pin.unique_id)
        self.assertEqual(response_item["image_url"], pin.image_url)
        self.assertEqual(response_item["title"], pin.title)

        author_data = response_item["author"]

        self.check_author_data_against_account_object(
            author_data=author_data, account=pin.author
        )

    def check_author_data_against_account_object(self, author_data=None, account=None):
        self.assertEqual(len(author_data), 4)

        self.assertEqual(author_data["username"], account.username)
        self.assertEqual(author_data["display_name"], account.display_name)
        self.assertEqual(author_data["initial"], account.initial)
        self.assertEqual(
            author_data["profile_picture_url"], account.profile_picture_url
        )

    def test_get_pin_suggestions_second_page(self):
        response = self.get(page=2)

        self.check_response_second_page(response=response)

    def check_response_second_page(self, response=None):
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()

        self.assertEqual(response_data["count"], NUMBER_EXISTING_PINS)

        self.check_first_item_response_second_page(response_data=response_data)

    def check_first_item_response_second_page(self, response_data=None):
        first_response_item = response_data["results"][0]

        most_recent_pin_second_page = Pin.objects.order_by("-created_at")[
            PAGINATION_PAGE_SIZE
        ]

        self.check_response_item_against_pin_object(
            response_item=first_response_item, pin=most_recent_pin_second_page
        )
