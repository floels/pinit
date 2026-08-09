from moto import mock_aws
from django.test import override_settings
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from ..testing_utils import AccountFactory
from pinit_api.models import Pin
from pinit_api.lib.constants import (
    ERROR_CODE_MISSING_PIN_IMAGE_FILE,
    ERROR_CODE_INVALID_PIN_IMAGE_FILE_KEY,
    ERROR_CODE_INVALID_PIN_IMAGE_DIMENSIONS,
)
from pinit_api.views.pin_creation import MAX_IMAGE_DIMENSION

S3_BUCKET_NAME = "pinit-pins"
S3_BUCKET_REGION = "eu-north-1"
S3_CUSTOM_DOMAIN = "pinit-pins.s3.eu-west-3.amazonaws.com"

VALID_IMAGE_FILE_KEY = "pins/pin_image_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4.jpg"


@override_settings(
    AWS_STORAGE_BUCKET_NAME=S3_BUCKET_NAME,
    AWS_S3_REGION_NAME=S3_BUCKET_REGION,
    AWS_S3_CUSTOM_DOMAIN=S3_CUSTOM_DOMAIN,
    AWS_QUERYSTRING_AUTH=False,
    AWS_S3_ENDPOINT_URL=None,
    AWS_S3_URL_PROTOCOL="https:",
    STORAGES={
        "default": {"BACKEND": "storages.backends.s3boto3.S3Boto3Storage"},
        "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
    },
)
class PinCreationTests(APITestCase):
    def setUp(self):
        self.s3_mock = mock_aws()
        self.s3_mock.start()

        self.account = AccountFactory()
        self.user = self.account.owner

        self.client = APIClient()
        self.client.force_authenticate(self.user)

        self.request_payload = {
            "title": "Title",
            "description": "Description",
            "image_file_key": VALID_IMAGE_FILE_KEY,
            "image_width": 1024,
            "image_height": 768,
        }

    def tearDown(self):
        self.s3_mock.stop()
        super().tearDown()

    def post(self, data=None):
        return self.client.post(
            "/api/pins/",
            data or self.request_payload,
            format="json",
        )

    def test_create_pin_happy_path(self):
        response = self.post()

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        created_pin = Pin.objects.get()

        self.check_response(response=response, created_pin=created_pin)
        self.check_created_pin(created_pin=created_pin)

    def check_response(self, response=None, created_pin=None):
        response_data = response.json()

        self.assertEqual(len(response_data), 5)
        self.assertEqual(response_data["unique_id"], str(created_pin.unique_id))
        self.assertEqual(response_data["image_url"], created_pin.image_url)
        self.assertEqual(response_data["image_width"], created_pin.image_width)
        self.assertEqual(response_data["image_height"], created_pin.image_height)
        self.assertEqual(response_data["title"], created_pin.title)

    def check_created_pin(self, created_pin=None):
        self.assertEqual(created_pin.title, self.request_payload["title"])
        self.assertEqual(created_pin.description, self.request_payload["description"])
        self.assertEqual(created_pin.author.username, self.account.username)
        self.assertEqual(
            created_pin.image_url,
            f"https://{S3_CUSTOM_DOMAIN}/{VALID_IMAGE_FILE_KEY}",
        )
        self.assertEqual(created_pin.image_width, 1024)
        self.assertEqual(created_pin.image_height, 768)

    def test_create_pin_rejects_absent_image_dimensions(self):
        # Both dimensions are required, so that every read returns them.
        payload = {
            key: value
            for key, value in self.request_payload.items()
            if key not in ("image_width", "image_height")
        }

        response = self.post(data=payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json()["errors"],
            [{"code": ERROR_CODE_INVALID_PIN_IMAGE_DIMENSIONS}],
        )
        self.assertEqual(Pin.objects.count(), 0)

    def test_create_pin_accepts_image_dimensions_as_strings(self):
        response = self.post(
            data={**self.request_payload, "image_width": "800", "image_height": "600"}
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        created_pin = Pin.objects.get()

        self.assertEqual(created_pin.image_width, 800)
        self.assertEqual(created_pin.image_height, 600)

    def test_create_pin_rejects_invalid_image_dimensions(self):
        invalid_dimension_pairs = [
            (0, 768),
            (1024, 0),
            (-1, 768),
            (1024, -1),
            ("wide", 768),
            (1024, None),
            (None, 768),
            (True, 768),
            (MAX_IMAGE_DIMENSION + 1, 768),
            (1024, MAX_IMAGE_DIMENSION + 1),
        ]

        for width, height in invalid_dimension_pairs:
            with self.subTest(image_width=width, image_height=height):
                response = self.post(
                    data={
                        **self.request_payload,
                        "image_width": width,
                        "image_height": height,
                    }
                )

                self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
                self.assertEqual(
                    response.json()["errors"],
                    [{"code": ERROR_CODE_INVALID_PIN_IMAGE_DIMENSIONS}],
                )
                self.assertEqual(Pin.objects.count(), 0)

    def test_create_pin_missing_image_file_key(self):
        response = self.post(data={"title": "Title", "description": "Description"})

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json()["errors"],
            [{"code": ERROR_CODE_MISSING_PIN_IMAGE_FILE}],
        )
        self.assertEqual(Pin.objects.count(), 0)

    def test_create_pin_invalid_image_file_key(self):
        response = self.post(
            data={**self.request_payload, "image_file_key": "../../etc/passwd"}
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json()["errors"],
            [{"code": ERROR_CODE_INVALID_PIN_IMAGE_FILE_KEY}],
        )
        self.assertEqual(Pin.objects.count(), 0)

    def test_create_pin_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.post()
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
