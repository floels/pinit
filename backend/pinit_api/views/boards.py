from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from ..models import Board, Account, Pin
from ..serializers.board_serializers import (
    BoardReadBaseSerializer,
    BoardWithFullDetailsReadSerializer,
)
from pinit_api.domain.boards import create_board
from pinit_api.shared.constants import (
    ERROR_CODE_ACCOUNT_NOT_FOUND,
    ERROR_CODE_BOARD_NOT_FOUND,
    ERROR_CODE_BOARD_NAME_REQUIRED,
    ERROR_CODE_PIN_NOT_FOUND,
)


class CreateBoardView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        name = (request.data.get("name") or "").strip()
        pin_unique_id = request.data.get("pin_id")

        if not name:
            return Response(
                {"errors": [{"code": ERROR_CODE_BOARD_NAME_REQUIRED}]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        pin = None
        if pin_unique_id:
            pin = Pin.get_by_unique_id(pin_unique_id)
            if not pin:
                return Response(
                    {"errors": [{"code": ERROR_CODE_PIN_NOT_FOUND}]},
                    status=status.HTTP_404_NOT_FOUND,
                )

        board = create_board(name=name, author=request.user.account, pin=pin)

        serializer = BoardReadBaseSerializer(board)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


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
