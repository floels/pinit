import time
from datetime import datetime, timedelta, timezone

from django.conf import settings
from django.test import TestCase, override_settings

from pinit_api.models import User
from pinit_api.lib.utils.tokens import (
    InvalidTokenError,
    create_access_token,
    decode_access_token,
)


class CreateAccessTokenTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="token.user@example.com", password="Pa$$wOrd_token"
        )

    def test_returns_non_empty_token_string(self):
        token, _ = create_access_token(self.user)
        self.assertIsInstance(token, str)
        self.assertTrue(token)

    def test_token_uses_paseto_v4_local(self):
        token, _ = create_access_token(self.user)
        self.assertTrue(token.startswith("v4.local."))

    def test_expiration_matches_configured_lifetime(self):
        _, expiration_utc = create_access_token(self.user)

        expected = datetime.now(timezone.utc) + settings.ACCESS_TOKEN_LIFETIME
        delta_seconds = abs((expiration_utc - expected).total_seconds())
        self.assertLess(delta_seconds, 60)


class DecodeAccessTokenTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="token.user@example.com", password="Pa$$wOrd_token"
        )

    def test_round_trip_carries_user_id_in_sub_claim(self):
        token, _ = create_access_token(self.user)

        claims = decode_access_token(token)

        self.assertEqual(claims["sub"], str(self.user.pk))

    def test_tampered_token_is_rejected(self):
        token, _ = create_access_token(self.user)
        tampered = token[:-4] + "AAAA"

        with self.assertRaises(InvalidTokenError):
            decode_access_token(tampered)

    def test_malformed_token_is_rejected(self):
        with self.assertRaises(InvalidTokenError):
            decode_access_token("not-a-paseto-token")

    @override_settings(ACCESS_TOKEN_LIFETIME=timedelta(seconds=1))
    def test_expired_token_is_rejected(self):
        token, _ = create_access_token(self.user)

        time.sleep(2)

        with self.assertRaises(InvalidTokenError):
            decode_access_token(token)
