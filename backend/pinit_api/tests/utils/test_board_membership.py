from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from pinit_api.domain.boards import save_pin_to_board
from pinit_api.models import PinInBoard
from ..testing_utils import BoardFactory, PinFactory


class SavePinToBoardTests(TestCase):
    def setUp(self):
        self.board = BoardFactory()
        self.pin = PinFactory()

    def test_first_save_creates_membership_and_bumps_board(self):
        pin_in_board, created = save_pin_to_board(self.pin, self.board)

        self.assertTrue(created)
        self.assertEqual(pin_in_board.pin, self.pin)
        self.assertEqual(pin_in_board.board, self.board)
        self.assertEqual(PinInBoard.objects.filter(board=self.board).count(), 1)

        self.board.refresh_from_db()
        self.assertAlmostEqual(
            self.board.last_pin_added_at,
            timezone.now(),
            delta=timedelta(seconds=1),
        )
        self.assertAlmostEqual(
            pin_in_board.last_saved_at,
            timezone.now(),
            delta=timedelta(seconds=1),
        )

    def test_re_save_is_idempotent_and_bumps_timestamps(self):
        first, created_first = save_pin_to_board(self.pin, self.board)
        self.assertTrue(created_first)

        earlier = timezone.now() - timedelta(days=1)
        PinInBoard.objects.filter(pk=first.pk).update(last_saved_at=earlier)
        self.board.last_pin_added_at = earlier
        self.board.save(update_fields=["last_pin_added_at"])

        pin_in_board, created = save_pin_to_board(self.pin, self.board)

        self.assertFalse(created)
        self.assertEqual(pin_in_board.pk, first.pk)
        self.assertEqual(PinInBoard.objects.filter(board=self.board).count(), 1)

        pin_in_board.refresh_from_db()
        self.board.refresh_from_db()
        self.assertAlmostEqual(
            pin_in_board.last_saved_at,
            timezone.now(),
            delta=timedelta(seconds=1),
        )
        self.assertAlmostEqual(
            self.board.last_pin_added_at,
            timezone.now(),
            delta=timedelta(seconds=1),
        )
