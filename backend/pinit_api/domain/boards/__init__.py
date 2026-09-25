"""Board membership and identity.

Views authorize and map HTTP errors; this package owns how pins join boards
(and, later, how boards get unique slugs).
"""

from .membership import save_pin_to_board

__all__ = [
    "save_pin_to_board",
]
