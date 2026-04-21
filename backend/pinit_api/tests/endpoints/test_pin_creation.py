import boto3
from io import BytesIO
from moto import mock_s3
from unittest import mock
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from ..testing_utils import AccountFactory
from pinit_api.models import Pin
from pinit_api.lib.constants import (
    ERROR_CODE_MISSING_PIN_IMAGE_FILE,
    ERROR_CODE_PIN_CREATION_FAILED,
)

S3_BUCKET_NAME = "pinit-staging"
S3_BUCKET_REGION = "eu-north-1"


# Inspired by https://docs.getmoto.org/en/latest/docs/getting_started.html#class-decorator
@mock_s3
@mock.patch(
    "pinit_api.views.pin_creation.settings.S3_PINS_BUCKET_URL",
    new="pinit-staging.s3.eu-west-3.amazonaws.com",
)
class PinCreationTests(APITestCase):
    def setUp(self):
        self.account = AccountFactory()
        self.user = self.account.owner

        self.client = APIClient()
        self.client.force_authenticate(self.user)

        self.pin_image_file_content = b"pin image data"
        self.pin_image_file = BytesIO(self.pin_image_file_content)
        self.pin_image_file.name = "pin_image_file.jpg"

        self.create_s3_bucket()

        self.request_payload = {
            "title": "Title",
            "description": "Description",
            "image_file": self.pin_image_file,
        }

    def create_s3_bucket(self):
        s3_client = boto3.client("s3", region_name=S3_BUCKET_REGION)
        s3_client.create_bucket(
            Bucket=S3_BUCKET_NAME,
            CreateBucketConfiguration={"LocationConstraint": "eu-north-1"},
        )

    def test_create_pin_happy_path(self):
        response = self.post()

        created_pin = Pin.objects.get()

        self.check_response_happy_path(response=response, created_pin=created_pin)

        image_file_key_in_s3 = f"pins/pin_{created_pin.unique_id}.jpg"

        self.check_created_pin(
            created_pin=created_pin,
            image_file_key_in_s3=image_file_key_in_s3,
        )

        self.check_file_content_in_s3(
            file_key=image_file_key_in_s3, expected_content=self.pin_image_file_content
        )

    def post(self, data=None):
        return self.client.post(
            "/api/create-pin/", data or self.request_payload, format="multipart"
        )

    def check_response_happy_path(self, response=None, created_pin=None):
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        response_data = response.json()

        self.assertEqual(len(response_data), 3)

        self.assertEqual(response_data["unique_id"], created_pin.unique_id)
        self.assertEqual(response_data["image_url"], created_pin.image_url)
        self.assertEqual(response_data["title"], created_pin.title)

    def check_created_pin(self, created_pin=None, image_file_key_in_s3=""):
        self.assertEqual(created_pin.title, self.request_payload["title"])
        self.assertEqual(created_pin.description, self.request_payload["description"])
        self.assertEqual(created_pin.author.username, self.account.username)
        self.assertEqual(
            created_pin.image_url,
            f"https://pinit-staging.s3.eu-west-3.amazonaws.com/{image_file_key_in_s3}",
        )

    def check_file_content_in_s3(self, file_key="", expected_content=None):
        s3 = boto3.resource("s3")

        object = s3.Object(S3_BUCKET_NAME, file_key)

        file_content = object.get()["Body"].read()

        self.assertEqual(file_content, expected_content)

    def test_create_pin_s3_upload_fails(self):
        with mock.patch("boto3.client") as mock_s3_client:
            mock_s3_client.return_value.upload_fileobj.side_effect = Exception(
                "S3 upload failed"
            )

            response = self.post()

            self.check_response_upload_fails(response=response)

            self.check_no_pin_created()

    def check_response_upload_fails(self, response=None):
        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        response_data = response.json()
        self.assertEqual(
            response_data["errors"], [{"code": ERROR_CODE_PIN_CREATION_FAILED}]
        )

    def check_no_pin_created(self):
        self.assertEqual(Pin.objects.count(), 0)

    def test_create_pin_missing_file(self):
        request_payload = {"title": "Title", "description": "Description"}

        response = self.post(data=request_payload)

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.check_response_missing_file(response=response)

        self.check_no_pin_created()

    def check_response_missing_file(self, response=None):
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        response_data = response.json()

        self.assertEqual(
            response_data["errors"], [{"code": ERROR_CODE_MISSING_PIN_IMAGE_FILE}]
        )
