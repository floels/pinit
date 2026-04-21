from ..models import Board, Account
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from ..serializers.board_serializers import BoardWithFullDetailsReadSerializer
from pinit_api.lib.constants import (
    ERROR_CODE_ACCOUNT_NOT_FOUND,
    ERROR_CODE_BOARD_NOT_FOUND,
)


class GetBoardDetailsView(APIView):
    def get(self, request, username, slug):
        try:
            account = Account.objects.get(username=username)
        except:
            return self.get_response_account_not_found()

        try:
            board = Board.objects.get(author=account, slug=slug)
        except:
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
