from datetime import timedelta

from django.test import TestCase, override_settings

from pinit_api.models import RefreshToken, User
from pinit_api.lib.utils.refresh_tokens import (
    InvalidRefreshTokenError,
    issue_refresh_token,
    revoke_refresh_token,
    rotate_refresh_token,
)


class RefreshTokenServiceTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="refresh.user@example.com", password="Pa$$wOrd_refresh"
        )

    def test_issue_returns_non_empty_opaque_token(self):
        raw_token = issue_refresh_token(self.user)

        self.assertIsInstance(raw_token, str)
        self.assertTrue(raw_token)

    def test_issue_stores_only_a_hash_not_the_raw_token(self):
        raw_token = issue_refresh_token(self.user)

        stored = RefreshToken.objects.get(user=self.user)
        self.assertNotEqual(stored.token_hash, raw_token)
        self.assertEqual(len(stored.token_hash), 64)  # sha256 hex digest
        self.assertFalse(
            RefreshToken.objects.filter(token_hash=raw_token).exists()
        )

    def test_issue_sets_expiry_from_configured_lifetime_and_no_revocation(self):
        from django.conf import settings
        from django.utils import timezone

        issue_refresh_token(self.user)

        stored = RefreshToken.objects.get(user=self.user)
        self.assertIsNone(stored.revoked_at)
        expected = timezone.now() + settings.REFRESH_TOKEN_LIFETIME
        self.assertLess(abs((stored.expires_at - expected).total_seconds()), 60)

    def test_revoke_unknown_token_is_a_no_op(self):
        revoke_refresh_token("never-issued")  # must not raise

    def test_rotate_issues_new_usable_token_and_revokes_old(self):
        old_token = issue_refresh_token(self.user)

        new_token, user = rotate_refresh_token(old_token)

        self.assertEqual(user, self.user)
        self.assertNotEqual(new_token, old_token)
        # The old token is now revoked — rotating it again fails...
        with self.assertRaises(InvalidRefreshTokenError):
            rotate_refresh_token(old_token)
        # ...while the new token is usable (it can itself be rotated).
        newer_token, user_again = rotate_refresh_token(new_token)
        self.assertEqual(user_again, self.user)
        self.assertNotEqual(newer_token, new_token)

    def test_rotate_rejects_unknown_token(self):
        with self.assertRaises(InvalidRefreshTokenError):
            rotate_refresh_token("never-issued")

    def test_rotate_rejects_already_revoked_token(self):
        old_token = issue_refresh_token(self.user)
        revoke_refresh_token(old_token)

        with self.assertRaises(InvalidRefreshTokenError):
            rotate_refresh_token(old_token)

    @override_settings(REFRESH_TOKEN_LIFETIME=timedelta(seconds=-1))
    def test_rotate_rejects_expired_token(self):
        raw_token = issue_refresh_token(self.user)

        with self.assertRaises(InvalidRefreshTokenError):
            rotate_refresh_token(raw_token)
