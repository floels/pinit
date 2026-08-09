import uuid
from django.core.exceptions import ValidationError
from django.db import models
from django.contrib.auth.models import AbstractBaseUser
from django.utils import timezone
from pinit_api.lib.utils.user_manager import UserManager


class UUIDModel(models.Model):
    """Abstract base giving a model a public, URL-safe UUID identifier.

    ``unique_id`` is unique by construction (uuid4), so it needs no
    collision-checking, retry loop, or per-save generation logic — the value is
    assigned by the field default at instantiation.
    """

    unique_id = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    class Meta:
        abstract = True

    @classmethod
    def get_by_unique_id(cls, unique_id):
        """Return the instance for ``unique_id``, or ``None`` if it is missing
        or not a well-formed UUID (so malformed input yields a graceful 404
        rather than a 500 from the field's UUID parsing)."""
        try:
            return cls.objects.filter(unique_id=unique_id).first()
        except (ValidationError, ValueError):
            return None


class User(AbstractBaseUser):
    # See https://docs.djangoproject.com/en/4.1/topics/auth/customizing/#specifying-a-custom-user-model
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    birthdate = models.DateField(blank=True, null=True)
    is_admin = models.BooleanField(default=False)

    objects = UserManager()

    USERNAME_FIELD = "email"
    EMAIL_FIELD = "email"

    def __str__(self):
        return f"User {self.email}"

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.is_admin


class RefreshToken(models.Model):
    """An opaque, revocable refresh token.

    The raw token is a random string handed to the client; only its SHA-256
    hash is persisted here, so a database leak does not expose usable tokens.
    A token is usable while it is neither revoked nor past ``expires_at``.
    """

    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="refresh_tokens"
    )
    token_hash = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    revoked_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"RefreshToken for {self.user} (…{self.token_hash[-6:]})"

    @property
    def is_expired(self):
        return self.expires_at <= timezone.now()

    @property
    def is_revoked(self):
        return self.revoked_at is not None

    @property
    def is_valid(self):
        return not self.is_revoked and not self.is_expired

    def revoke(self):
        if self.revoked_at is None:
            self.revoked_at = timezone.now()
            self.save(update_fields=["revoked_at"])


class Account(models.Model):
    username = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    type = models.CharField(max_length=50)  # "personal" or "business"
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    business_name = models.CharField(max_length=100, blank=True, null=True)
    initial = models.CharField(max_length=1, blank=True, null=True)
    profile_picture_url = models.URLField(blank=True, null=True)
    background_picture_url = models.URLField(blank=True, null=True)
    description = models.TextField(null=True, blank=True)
    owner = models.OneToOneField(User, on_delete=models.CASCADE)

    @property
    def display_name(self):
        if self.type == "personal":
            return f"{self.first_name} {self.last_name}"

        return self.business_name

    def __str__(self):
        return f"Account {self.username}"


class Pin(UUIDModel):
    created_at = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=200, null=True, blank=True)
    image_url = models.URLField(null=True, blank=True)
    # Pixel dimensions of the image at 'image_url'. Clients need them to lay out
    # the masonry grid before the image loads. The client that creates the pin
    # reports them, because the image is uploaded straight to S3 and the backend
    # never reads its bytes. 'CreatePinView' requires both, so every pin created
    # through the API carries them. The columns stay nullable for the rows that
    # predate them.
    image_width = models.PositiveIntegerField(null=True, blank=True)
    image_height = models.PositiveIntegerField(null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    author = models.ForeignKey(Account, on_delete=models.CASCADE)

    def __str__(self):
        return f"Pin {self.unique_id}"


class Board(UUIDModel):
    created_at = models.DateTimeField(auto_now_add=True)
    name = models.CharField(max_length=200)
    slug = models.CharField(max_length=200, null=True, blank=True)
    author = models.ForeignKey(Account, on_delete=models.CASCADE, related_name="boards")
    pins = models.ManyToManyField(Pin, through="PinInBoard", related_name="boards")
    last_pin_added_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = (("author", "slug"),)

    def __str__(self):
        return f"Board {self.unique_id}"


class PinInBoard(models.Model):
    pin = models.ForeignKey(Pin, on_delete=models.CASCADE)
    board = models.ForeignKey(
        Board, on_delete=models.CASCADE, related_name="pins_in_board"
    )
    last_saved_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("pin", "board")
        verbose_name_plural = "Pins in boards"

    def __str__(self):
        return f"{self.pin} in {self.board}"
