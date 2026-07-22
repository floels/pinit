from django.db import IntegrityError, transaction
from django.utils import timezone
from django.utils.text import slugify
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from ..models import Board, Account, Pin
from ..serializers.board_serializers import (
    BoardReadBaseSerializer,
    BoardWithFullDetailsReadSerializer,
)
from pinit_api.lib.constants import (
    ERROR_CODE_ACCOUNT_NOT_FOUND,
    ERROR_CODE_BOARD_NOT_FOUND,
    ERROR_CODE_BOARD_NAME_REQUIRED,
    ERROR_CODE_PIN_NOT_FOUND,
)


class CreateBoardView(APIView):
    permission_classes = [IsAuthenticated]

    # Number of times to recompute a unique slug and retry the insert when a
    # concurrent request wins the same slug between the check and the create.
    MAX_SLUG_ATTEMPTS = 5

    def post(self, request):
        name = (request.data.get("name") or "").strip()
        pin_unique_id = request.data.get("pin_id")

        if not name:
            return Response(
                {"errors": [{"code": ERROR_CODE_BOARD_NAME_REQUIRED}]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        author = request.user.account
        base_slug = slugify(name)

        pin = None
        if pin_unique_id:
            pin = Pin.objects.filter(unique_id=pin_unique_id).first()
            if not pin:
                return Response(
                    {"errors": [{"code": ERROR_CODE_PIN_NOT_FOUND}]},
                    status=status.HTTP_404_NOT_FOUND,
                )

        board = self.create_board(base_slug=base_slug, author=author, name=name, pin=pin)

        serializer = BoardReadBaseSerializer(board)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def create_board(self, base_slug, author, name, pin):
        # get_unique_slug() reads the taken slugs and create() writes the new
        # row as two separate steps, so a concurrent request can grab the slug
        # in between. The (author, slug) unique constraint turns that into an
        # IntegrityError; recompute the slug and retry rather than surfacing a
        # 500. The whole board + pin write runs in a single transaction so a
        # failure never leaves a half-created board behind.
        for attempt in range(self.MAX_SLUG_ATTEMPTS):
            slug = self.get_unique_slug(base_slug=base_slug, author=author)
            try:
                with transaction.atomic():
                    board = Board.objects.create(
                        name=name, slug=slug, author=author
                    )
                    if pin:
                        board.pins.add(pin)
                        board.last_pin_added_at = timezone.now()
                        board.save()
                return board
            except IntegrityError:
                if attempt == self.MAX_SLUG_ATTEMPTS - 1:
                    raise

    def get_unique_slug(self, base_slug, author):
        slug = base_slug
        counter = 2
        while Board.objects.filter(author=author, slug=slug).exists():
            slug = f"{base_slug}-{counter}"
            counter += 1
        return slug


class GetBoardDetailsView(APIView):
    def get(self, request, username, slug):
        try:
            account = Account.objects.get(username=username)
        except Account.DoesNotExist:
            return self.get_response_account_not_found()

        try:
            board = Board.objects.get(author=account, slug=slug)
        except Board.DoesNotExist:
            return self.get_response_board_not_found()

        serializer = BoardWithFullDetailsReadSerializer(board)

        return Response(serializer.data)

    def get_response_account_not_found(self):
        return Response(
            {"errors": [{"code": ERROR_CODE_ACCOUNT_NOT_FOUND}]},
            status=status.HTTP_404_NOT_FOUND,
        )

    def get_response_board_not_found(self):
        return Response(
            {"errors": [{"code": ERROR_CODE_BOARD_NOT_FOUND}]},
            status=status.HTTP_404_NOT_FOUND,
        )
