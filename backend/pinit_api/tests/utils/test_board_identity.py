from unittest.mock import patch

from django.db import IntegrityError
from django.test import TestCase

from pinit_api.domain.boards import create_board
from pinit_api.domain.boards.identity import MAX_SLUG_ATTEMPTS
from pinit_api.models import Board
from ..testing_utils import AccountFactory, BoardFactory, PinFactory


class CreateBoardDomainTests(TestCase):
    def setUp(self):
        self.author = AccountFactory()
        self.pin = PinFactory()

    def test_creates_board_with_slugified_name(self):
        board = create_board(name="My Travel Board", author=self.author)

        self.assertEqual(board.name, "My Travel Board")
        self.assertEqual(board.slug, "my-travel-board")
        self.assertEqual(board.author, self.author)

    def test_attaches_optional_pin(self):
        board = create_board(name="With Pin", author=self.author, pin=self.pin)

        self.assertIn(self.pin, board.pins.all())
        board.refresh_from_db()
        self.assertIsNotNone(board.last_pin_added_at)

    def test_suffixes_slug_when_taken(self):
        BoardFactory(author=self.author, name="My Board", slug="my-board")
        BoardFactory(author=self.author, name="My Board 2", slug="my-board-2")

        board = create_board(name="My Board", author=self.author)

        self.assertEqual(board.slug, "my-board-3")

    def test_retries_on_slug_race(self):
        real_create = Board.objects.create
        slugs_attempted = []

        def flaky_create(*args, **kwargs):
            slugs_attempted.append(kwargs.get("slug"))
            if len(slugs_attempted) == 1:
                raise IntegrityError("duplicate key value violates unique constraint")
            return real_create(*args, **kwargs)

        with patch.object(Board.objects, "create", side_effect=flaky_create):
            board = create_board(name="My Board", author=self.author)

        self.assertEqual(board.slug, "my-board")
        self.assertEqual(len(slugs_attempted), 2)

    def test_gives_up_after_bounded_retries(self):
        with patch.object(
            Board.objects, "create", side_effect=IntegrityError("duplicate")
        ) as mock_create:
            with self.assertRaises(IntegrityError):
                create_board(name="My Board", author=self.author)

        self.assertEqual(mock_create.call_count, MAX_SLUG_ATTEMPTS)

    def test_rolls_back_board_when_pin_attach_fails(self):
        with patch(
            "pinit_api.domain.boards.identity.save_pin_to_board",
            side_effect=RuntimeError("boom"),
        ):
            with self.assertRaises(RuntimeError):
                create_board(name="My Board", author=self.author, pin=self.pin)

        self.assertFalse(Board.objects.filter(name="My Board").exists())
