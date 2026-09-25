from django.test import TestCase

from pinit_api.domain.auth import (
    InvalidSessionError,
    issue_session,
    revoke_session,
    rotate_session,
)
from pinit_api.domain.auth.access_tokens import decode_access_token
from pinit_api.models import RefreshToken, User


class AuthSessionTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="session.user@example.com", password="Pa$$wOrd_session"
        )

    def test_issue_session_returns_access_and_refresh(self):
        session = issue_session(self.user)

        self.assertIn("access_token", session)
        self.assertIn("access_token_expiration_utc", session)
        self.assertIn("refresh_token", session)
        claims = decode_access_token(session["access_token"])
        self.assertEqual(claims["sub"], str(self.user.pk))
        self.assertEqual(RefreshToken.objects.filter(user=self.user).count(), 1)

    def test_rotate_session_revokes_old_and_mints_new_pair(self):
        issued = issue_session(self.user)
        rotated = rotate_session(issued["refresh_token"])

        self.assertNotEqual(rotated["refresh_token"], issued["refresh_token"])
        self.assertNotEqual(rotated["access_token"], issued["access_token"])

        with self.assertRaises(InvalidSessionError):
            rotate_session(issued["refresh_token"])

        claims = decode_access_token(rotated["access_token"])
        self.assertEqual(claims["sub"], str(self.user.pk))

    def test_revoke_session_is_best_effort(self):
        issued = issue_session(self.user)
        revoke_session(issued["refresh_token"])
        revoke_session("never-issued")  # must not raise

        with self.assertRaises(InvalidSessionError):
            rotate_session(issued["refresh_token"])
