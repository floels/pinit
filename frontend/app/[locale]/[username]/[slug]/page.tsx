import { API_BASE_URL, API_ENDPOINT_BOARD_DETAILS } from "@/lib/constants";
import { Response404Error } from "@/lib/customErrors";
import { serializeBoardWithFullDetails } from "@/lib/utils/serializers";
import { throwIfKO } from "@/lib/utils/fetch";
import { redirect } from "next/navigation";
import ErrorView from "@/components/ErrorView/ErrorView";
import BoardDetailsView from "@/components/BoardDetailsView/BoardDetailsView";

type PageProps = {
  params: { username: string; slug: string };
};

const fetchBoardDetails = async ({
  username,
  slug,
}: {
  username: string;
  slug: string;
}) => {
  const url = `${API_BASE_URL}/${API_ENDPOINT_BOARD_DETAILS}/${username}/${slug}/`;

  const response = await fetch(url);

  if (response.status === 404) {
    throw new Response404Error();
  }

  throwIfKO(response);

  const responseData = await response.json();

  return serializeBoardWithFullDetails(responseData);
};

const renderUponError = ({ error }: { error: Error }) => {
  let errorMessageKey;

  if (error instanceof Response404Error) {
    errorMessageKey = "BoardDetails.ERROR_BOARD_NOT_FOUND";
  } else {
    errorMessageKey = "BoardDetails.ERROR_FETCH_BOARD_DETAILS";
  }

  return <ErrorView errorMessageKey={errorMessageKey} />;
};

const Page = async ({ params }: PageProps) => {
  const { username, slug } = params;

  if (!slug) {
    redirect("/");
  }

  let boardDetails;

  try {
    boardDetails = await fetchBoardDetails({ username, slug });
  } catch (error) {
    return renderUponError({ error: error as Error });
  }

  return <BoardDetailsView board={boardDetails} />;
};

export default Page;
