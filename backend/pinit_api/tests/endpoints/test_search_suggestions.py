from unittest.mock import patch

from rest_framework.test import APITestCase, APIClient
from rest_framework import status

from pinit_api.domain.search import SearchUnavailableError
from pinit_api.views.search_suggestions import ERROR_CODE_MISSING_SEARCH_PARAMETER


class SearchSuggestionsTests(APITestCase):
    def setUp(self):
        self.client = APIClient()

    def get(self, search=""):
        return self.client.get("/api/search/suggestions/", {"search": search})

    @patch("pinit_api.views.search_suggestions.suggest_pins")
    def test_get_search_suggestions_happy_path(self, mock_suggest):
        expected = ["beach", "beacha", "beacheresque", "beachiful", "beacho", "beachy"]
        mock_suggest.return_value = expected

        response = self.get(search="beach")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertListEqual(response.json()["results"], expected)
        mock_suggest.assert_called_once_with("beach")

    def test_get_search_suggestions_missing_search_param(self):
        response = self.get(search="")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json()["errors"],
            [{"code": ERROR_CODE_MISSING_SEARCH_PARAMETER}],
        )

    @patch("pinit_api.views.search_suggestions.suggest_pins")
    def test_get_search_suggestions_unavailable_returns_503(self, mock_suggest):
        mock_suggest.side_effect = SearchUnavailableError()

        response = self.get(search="beach")

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)
