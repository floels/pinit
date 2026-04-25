import re
import boto3
from moto import mock_aws
from django.test import override_settings
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from ..testing_utils import AccountFactory
from pinit_api.lib.constants import ERROR_CODE_INVALID_PIN_IMAGE_FILE_EXTENSION

S3_BUCKET_NAME = "pinit-staging"
S3_BUCKET_REGION = "eu-north-1"
S3_CUSTOM_DOMAIN = "pinit-staging.s3.eu-west-3.amazonaws.com"

IMAGE_FILE_KEY_PATTERN = re.compile(r"^pins/pin_image_[0-9a-f]{32}\.(jpg|png)$")


@override_settings(
    AWS_STORAGE_BUCKET_NAME=S3_BUCKET_NAME,
    AWS_S3_REGION_NAME=S3_BUCKET_REGION,
    AWS_S3_CUSTOM_DOMAIN=S3_CUSTOM_DOMAIN,
    AWS_QUERYSTRING_AUTH=False,
    AWS_S3_ENDPOINT_URL=None,
    STORAGES={
        "default": {"BACKEND": "storages.backends.s3boto3.S3Boto3Storage"},
        "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
    },
)
class PinImageUploadUrlTests(APITestCase):
    def setUp(self):
        self.s3_mock = mock_aws()
        self.s3_mock.start()

        self.account = AccountFactory()
        self.user = self.account.owner

        self.client = APIClient()
        self.client.force_authenticate(self.user)

        s3_client = boto3.client("s3", region_name=S3_BUCKET_REGION)
        s3_client.create_bucket(
            Bucket=S3_BUCKET_NAME,
            CreateBucketConfiguration={"LocationConstraint": S3_BUCKET_REGION},
        )

    def tearDown(self):
        self.s3_mock.stop()
        super().tearDown()

    def get(self, file_extension=None):
        url = "/api/pin-image-upload-url/"
        if file_extension is not None:
            url += f"?file_extension={file_extension}"
        return self.client.get(url)

    def test_get_upload_url_jpg(self):
        response = self.get(file_extension=".jpg")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        response_data = response.json()

        self.assertIn("upload_url", response_data)
        self.assertIn("image_file_key", response_data)

        image_file_key = response_data["image_file_key"]
        self.assertRegex(image_file_key, IMAGE_FILE_KEY_PATTERN)
        self.assertTrue(image_file_key.endswith(".jpg"))

        upload_url = response_data["upload_url"]
        self.assertIn(image_file_key, upload_url)

    def test_get_upload_url_png(self):
        response = self.get(file_extension=".png")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        image_file_key = response.json()["image_file_key"]
        self.assertTrue(image_file_key.endswith(".png"))

    def test_get_upload_url_invalid_extension(self):
        response = self.get(file_extension=".gif")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json()["errors"],
            [{"code": ERROR_CODE_INVALID_PIN_IMAGE_FILE_EXTENSION}],
        )

    def test_get_upload_url_missing_extension(self):
        response = self.get()

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(
            response.json()["errors"],
            [{"code": ERROR_CODE_INVALID_PIN_IMAGE_FILE_EXTENSION}],
        )

    def test_get_upload_url_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.get(file_extension=".jpg")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
