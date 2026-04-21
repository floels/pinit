from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.conf import settings

from ..testing_utils import PinFactory
from pinit_api.views.search import ERROR_CODE_MISSING_SEARCH_PARAMETER
from pinit_api.models import Pin

NUMBER_PINS_MATCHING_SEARCH_TITLE = 75
NUMBER_PINS_MATCHING_SEARCH_DESCRIPTION = 75

PAGINATION_PAGE_SIZE = settings.REST_FRAMEWORK["PAGE_SIZE"]


class SearchTests(APITestCase):
    def setUp(self):
        self.client = APIClient()

        # We will search for pins containing "sunset":
        self.first_batch = PinFactory.create_batch(
            NUMBER_PINS_MATCHING_SEARCH_TITLE, title="Beautiful sunset", description=""
        )
        self.second_batch = PinFactory.create_batch(
            NUMBER_PINS_MATCHING_SEARCH_DESCRIPTION,
            title="Some title",
            description="That's a beautiful sunset.",
        )

    def test_search_pins_happy_path_first_page(self):
        response = self.get(page=1)

        self.check_response_first_page(response=response)

    def check_response_first_page(self, response=None):
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()

        self.assertEqual(
            response_data["count"],
            NUMBER_PINS_MATCHING_SEARCH_TITLE + NUMBER_PINS_MATCHING_SEARCH_DESCRIPTION,
        )

        first_result, last_result = self.get_first_and_last_results(
            response_data=response_data
        )

        self.check_first_result_first_page(first_result=first_result)

        self.check_last_result_first_page(last_result=last_result)

        self.check_results_ordering(first_result=first_result, last_result=last_result)

    def get_first_and_last_results(self, response_data=None):
        first_result = response_data["results"][0]
        last_result = response_data["results"][PAGINATION_PAGE_SIZE - 1]

        return first_result, last_result

    def check_first_result_first_page(self, first_result=None):
        self.assertEqual(len(first_result), 4)

        self.assertTrue(first_result["unique_id"])
        self.assertEqual(first_result["title"], "Beautiful sunset")
        self.assertTrue(first_result["image_url"])

        author_data = first_result["author"]

        self.check_author_data(author_data=author_data)

    def check_author_data(self, author_data=None):
        self.assertEqual(len(author_data), 4)

        self.assertTrue(author_data["username"])
        self.assertTrue(author_data["display_name"])
        self.assertTrue(author_data["initial"])
        self.assertTrue(author_data["profile_picture_url"])

    def check_last_result_first_page(self, last_result=None):
        self.assertEqual(last_result["title"], "Beautiful sunset")

    def get(self, q="sunset", page=1):
        return self.client.get("/api/search/", {"q": q, "page": page})

    def check_results_ordering(self, first_result=None, last_result=None):
        pin_first_result = Pin.objects.get(unique_id=first_result["unique_id"])
        pin_last_result = Pin.objects.get(unique_id=last_result["unique_id"])

        self.assertGreater(pin_first_result.created_at, pin_last_result.created_at)

    def test_search_pins_happy_path_second_page(self):
        response = self.get(page=2)

        self.check_response_second_page(response=response)

    def check_response_second_page(self, response=None):
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()

        first_result, last_result = self.get_first_and_last_results(
            response_data=response_data
        )

        self.check_first_result_second_page(first_result=first_result)

        self.check_last_result_second_page(last_result=last_result)

    def check_first_result_second_page(self, first_result=None):
        self.assertEqual(first_result["title"], "Beautiful sunset")

    def check_last_result_second_page(self, last_result=None):
        self.assertEqual(last_result["title"], "Some title")

    def test_search_pins_no_result(self):
        response = self.get(q="horse")

        self.check_response_no_result(response=response)

    def check_response_no_result(self, response=None):
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()

        self.assertEqual(response_data["count"], 0)

        self.assertListEqual(response_data["results"], [])

    def test_search_pins_missing_search_param(self):
        response = self.get(q="")

        self.check_response_missing_search_param(response=response)

    def check_response_missing_search_param(self, response=None):
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response_data = response.json()

        self.assertEqual(
            response_data["errors"],
            [{"code": ERROR_CODE_MISSING_SEARCH_PARAMETER}],
        )
