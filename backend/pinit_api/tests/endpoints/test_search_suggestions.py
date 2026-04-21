from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from ..testing_utils import PinFactory
from pinit_api.views.search import ERROR_CODE_MISSING_SEARCH_PARAMETER


class SearchSuggestionsTests(APITestCase):
    def setUp(self):
        self.client = APIClient()

        # We will test a search autocomplete on "beach":
        PinFactory.create(
            title="My beacheresque view of a beachy beach",
            description="Isn't that beachiful-",
        )
        PinFactory.create(
            title="Isn't Beacho a beaufitul name for a boy?",
            description="And Beacha? Yes, beacha if it's a girl.",
        )
        PinFactory.create(
            title="Beautiful beach",
            description="I want to go to the beach.",
        )

    def test_get_search_suggestions_happy_path(self):
        response = self.get(search="beach")

        self.check_response_happy_path(response=response)

    def check_response_happy_path(self, response=None):
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()

        response_results = response_data["results"]

        # "beach" occurs three times so it should appear first in the list.
        # Then, "beacha" which occurs twice.
        # Then, all others, which occur once, ranked by alphabetical order.
        self.assertListEqual(
            response_results,
            ["beach", "beacha", "beacheresque", "beachiful", "beacho", "beachy"],
        )

    def get(self, search=""):
        return self.client.get("/api/search-suggestions/", {"search": search})

    def test_get_search_suggestions_missing_search_param(self):
        response = self.get(search="")

        self.check_response_missing_search_param(response=response)

    def check_response_missing_search_param(self, response=None):
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response_data = response.json()

        self.assertEqual(
            response_data["errors"],
            [{"code": ERROR_CODE_MISSING_SEARCH_PARAMETER}],
        )
