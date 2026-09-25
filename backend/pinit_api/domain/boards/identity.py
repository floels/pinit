from django.db import IntegrityError, transaction
from django.utils.text import slugify

from pinit_api.models import Board

from .membership import save_pin_to_board

# Number of times to recompute a unique slug and retry the insert when a
# concurrent request wins the same slug between the check and the create.
MAX_SLUG_ATTEMPTS = 5


def create_board(*, name, author, pin=None):
    """Create a board for ``author`` with a unique slug derived from ``name``.

    Optionally attaches ``pin`` via ``save_pin_to_board`` in the same
    transaction so a failed pin write never leaves a half-created board.

    ``get_unique_slug`` reads taken slugs and ``create`` writes as two steps, so
    a concurrent request can grab the slug in between. The ``(author, slug)``
    unique constraint turns that into an ``IntegrityError``; recompute and
    retry rather than surfacing a 500.
    """
    base_slug = slugify(name)

    for attempt in range(MAX_SLUG_ATTEMPTS):
        slug = _unique_slug(base_slug=base_slug, author=author)
        try:
            with transaction.atomic():
                board = Board.objects.create(name=name, slug=slug, author=author)
                if pin:
                    save_pin_to_board(pin, board)
            return board
        except IntegrityError:
            if attempt == MAX_SLUG_ATTEMPTS - 1:
                raise


def _unique_slug(*, base_slug, author):
    slug = base_slug
    counter = 2
    while Board.objects.filter(author=author, slug=slug).exists():
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug
