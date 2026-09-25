from unittest.mock import patch

from django.conf import settings
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from pinit_api.domain.search import SearchUnavailableError
from pinit_api.views.search import ERROR_CODE_MISSING_SEARCH_PARAMETER

PAGINATION_PAGE_SIZE = settings.REST_FRAMEWORK["PAGE_SIZE"]

SAMPLE_AUTHOR = {
    "username": "testuser",
    "display_name": "Test User",
    "initial": "T",
    "profile_picture_url": "https://example.com/avatar.jpg",
}


def make_result(title, unique_id=None):
    return {
        "unique_id": unique_id or "100000000000000001",
        "title": title,
        "image_url": "https://example.com/image.jpg",
        "image_width": 1024,
        "image_height": 768,
        "author": SAMPLE_AUTHOR,
    }


class SearchPinsTests(APITestCase):
    def setUp(self):
        self.client = APIClient()

    def get(self, q="sunset", page=1):
        return self.client.get("/api/search/", {"q": q, "page": page})

    @patch("pinit_api.views.search.find_pins")
    def test_happy_path_first_page(self, mock_find_pins):
        title_results = [
            make_result("Beautiful sunset", unique_id=str(i))
            for i in range(PAGINATION_PAGE_SIZE - 10)
        ]
        desc_results = [
            make_result("Some title", unique_id=str(i + PAGINATION_PAGE_SIZE))
            for i in range(10)
        ]
        mock_find_pins.return_value = {
            "total_count": 150,
            "results": title_results + desc_results,
        }

        response = self.get(page=1)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["count"], 150)
        self.assertEqual(len(data["results"]), PAGINATION_PAGE_SIZE)
        self.assertEqual(data["results"][0]["title"], "Beautiful sunset")
        self.assertEqual(data["results"][-1]["title"], "Some title")

        self._assert_result_shape(data["results"][0])
        self.assertEqual(data["results"][0]["image_width"], 1024)
        self.assertEqual(data["results"][0]["image_height"], 768)
        mock_find_pins.assert_called_once_with(
            query="sunset", page=1, page_size=PAGINATION_PAGE_SIZE
        )

    @patch("pinit_api.views.search.find_pins")
    def test_happy_path_second_page_passes_page(self, mock_find_pins):
        mock_find_pins.return_value = {
            "total_count": 150,
            "results": [make_result("Some title", unique_id=str(i)) for i in range(50)],
        }

        self.get(page=2)

        mock_find_pins.assert_called_once_with(
            query="sunset", page=2, page_size=PAGINATION_PAGE_SIZE
        )

    @patch("pinit_api.views.search.find_pins")
    def test_happy_path_pagination_links(self, mock_find_pins):
        mock_find_pins.return_value = {
            "total_count": 150,
            "results": [make_result("Pin", unique_id=str(i)) for i in range(50)],
        }

        response = self.get(page=2)
        data = response.json()

        self.assertIn("page=3", data["next"])
        self.assertIn("page=1", data["previous"])

    @patch("pinit_api.views.search.find_pins")
    def test_no_results(self, mock_find_pins):
        mock_find_pins.return_value = {"total_count": 0, "results": []}

        response = self.get(q="horse")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        data = response.json()
        self.assertEqual(data["count"], 0)
        self.assertListEqual(data["results"], [])
        self.assertIsNone(data["next"])
        self.assertIsNone(data["previous"])

    def test_missing_search_param(self):
        response = self.get(q="")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        data = response.json()
        self.assertEqual(
            data["errors"], [{"code": ERROR_CODE_MISSING_SEARCH_PARAMETER}]
        )

    @patch("pinit_api.views.search.find_pins")
    def test_search_unavailable_returns_503(self, mock_find_pins):
        mock_find_pins.side_effect = SearchUnavailableError()

        response = self.get()

        self.assertEqual(response.status_code, status.HTTP_503_SERVICE_UNAVAILABLE)

    def _assert_result_shape(self, result):
        self.assertEqual(
            set(result.keys()),
            {
                "unique_id",
                "title",
                "image_url",
                "image_width",
                "image_height",
                "author",
            },
        )
        author = result["author"]
        self.assertEqual(
            set(author.keys()),
            {"username", "display_name", "initial", "profile_picture_url"},
        )
