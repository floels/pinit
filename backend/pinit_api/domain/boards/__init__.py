"""Board membership and identity.

Views authorize and map HTTP errors; this package owns how pins join boards
and how boards get unique slugs on create.
"""

from .identity import create_board
from .membership import save_pin_to_board

__all__ = [
    "create_board",
    "save_pin_to_board",
]
