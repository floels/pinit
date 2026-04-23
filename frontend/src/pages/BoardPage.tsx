import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, API_ENDPOINT_BOARD_DETAILS } from "@/lib/constants";
import { throwIfKO } from "@/lib/utils/fetch";
import { serializeBoardWithFullDetails } from "@/lib/utils/serializers";
import { Response404Error } from "@/lib/customErrors";
import BoardDetailsView from "@/components/BoardDetailsView/BoardDetailsView";
import ErrorView from "@/components/ErrorView/ErrorView";
import SpinnerBelowHeader from "@/components/Spinners/SpinnerBelowHeader";

const BoardPage = () => {
  const { username, slug } = useParams<{ username: string; slug: string }>();

  const fetchBoardDetails = async () => {
    const url = `${API_BASE_URL}/${API_ENDPOINT_BOARD_DETAILS}/${username}/${slug}/`;

    const response = await fetch(url);

    if (response.status === 404) {
      throw new Response404Error();
    }

    throwIfKO(response);

    const responseData = await response.json();

    return serializeBoardWithFullDetails(responseData);
  };

  const shouldRetry = (_failureCount: number, error: unknown) => {
    return !(error instanceof Response404Error);
  };

  const { data: boardDetails, error, isLoading } = useQuery({
    queryKey: ["board", username, slug],
    queryFn: fetchBoardDetails,
    retry: shouldRetry,
  });

  if (isLoading) {
    return <SpinnerBelowHeader />;
  }

  if (error) {
    const errorMessageKey =
      error instanceof Response404Error
        ? "BoardDetails.ERROR_BOARD_NOT_FOUND"
        : "BoardDetails.ERROR_FETCH_BOARD_DETAILS";

    return <ErrorView errorMessageKey={errorMessageKey} />;
  }

  return <BoardDetailsView board={boardDetails!} />;
};

export default BoardPage;
