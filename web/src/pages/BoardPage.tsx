import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { API_URL_BOARD_DETAILS } from "@/lib/constants";
import { throwIfKO } from "@/lib/utils/fetch";
import { serializeBoardWithFullDetails } from "@/lib/utils/serializers";
import { Response404Error } from "@/lib/customErrors";
import BoardDetailsView from "@/components/BoardDetailsView/BoardDetailsView";
import ErrorView from "@/components/ErrorView/ErrorView";
import SpinnerBelowHeader from "@/components/Spinners/SpinnerBelowHeader";

const BoardPage = () => {
  const { t } = useTranslation("BoardDetails");
  const { username, slug } = useParams<{ username: string; slug: string }>();

  const fetchBoardDetails = async () => {
    const url = `${API_URL_BOARD_DETAILS}/${username}/${slug}/`;

    const response = await fetch(url);

    if (response.status === 404) {
      throw new Response404Error();
    }

    throwIfKO(response);

    const responseData = await response.json();

    return serializeBoardWithFullDetails(responseData);
  };

  const { data: boardDetails, error, isLoading } = useQuery({
    queryKey: ["board", username, slug],
    queryFn: fetchBoardDetails,
  });

  if (isLoading) {
    return <SpinnerBelowHeader />;
  }

  if (error) {
    const errorMessage =
      error instanceof Response404Error
        ? t("ERROR_BOARD_NOT_FOUND")
        : t("ERROR_FETCH_BOARD_DETAILS");

    return <ErrorView message={errorMessage} />;
  }

  return <BoardDetailsView board={boardDetails!} />;
};

export default BoardPage;
