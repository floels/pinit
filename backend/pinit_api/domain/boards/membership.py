from django.utils import timezone

from pinit_api.models import PinInBoard


def save_pin_to_board(pin, board):
    """Attach ``pin`` to ``board``, or bump timestamps if already saved.

    One idea — board membership — with one writer: create the ``PinInBoard``
    join row on first save, or refresh ``last_saved_at`` on re-save. Always
    bumps ``board.last_pin_added_at`` so the board sorts as recently active.

    Returns ``(pin_in_board, created)`` where ``created`` is True when the pin
    was newly added and False on an idempotent re-save.
    """
    now = timezone.now()

    pin_in_board, created = PinInBoard.objects.get_or_create(
        pin=pin,
        board=board,
        defaults={"last_saved_at": now},
    )
    if not created:
        pin_in_board.last_saved_at = now
        pin_in_board.save(update_fields=["last_saved_at"])

    board.last_pin_added_at = now
    board.save(update_fields=["last_pin_added_at"])

    return pin_in_board, created
