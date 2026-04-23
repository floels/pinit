import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL, API_ENDPOINT_BOARD_DETAILS } from "@/lib/constants";
import { throwIfKO } from "@/lib/utils/fetch";
import { serializeBoardWithFullDetails } from "@/lib/utils/serializers";
import { Response404Error } from "@/lib/customErrors";
import { BoardWithFullDetails } from "@/lib/types/frontendTypes";
import BoardDetailsView from "@/components/BoardDetailsView/BoardDetailsView";
import ErrorView from "@/components/ErrorView/ErrorView";
import SpinnerBelowHeader from "@/components/Spinners/SpinnerBelowHeader";

const BoardPage = () => {
  const { username, slug } = useParams<{ username: string; slug: string }>();
  const [board, setBoard] = useState<BoardWithFullDetails | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/${API_ENDPOINT_BOARD_DETAILS}/${username}/${slug}/`,
        );

        if (response.status === 404) throw new Response404Error();

        throwIfKO(response);

        const data = await response.json();
        setBoard(serializeBoardWithFullDetails(data));
      } catch (err) {
        setError(err as Error);
      }
    };

    fetchBoard();
  }, [username, slug]);

  if (error) {
    const errorMessageKey =
      error instanceof Response404Error
        ? "BoardDetails.ERROR_BOARD_NOT_FOUND"
        : "BoardDetails.ERROR_FETCH_BOARD_DETAILS";
    return <ErrorView errorMessageKey={errorMessageKey} />;
  }

  if (!board) {
    return <SpinnerBelowHeader />;
  }

  return <BoardDetailsView board={board} />;
};

export default BoardPage;
