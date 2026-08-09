import { useInfiniteQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { appendQueryParam } from "@/lib/utils/strings";
import { serializePinsWithAuthorDetails } from "@/lib/utils/serializers";
import { throwIfKO } from "@/lib/utils/fetch";
import { fetchPublic } from "@/lib/api/fetchers";
import { PinWithAuthorDetails } from "@/lib/types/frontendTypes";
import PinsBoard from "./PinsBoard";
import SpinnerBelowHeader from "@/components/Spinners/SpinnerBelowHeader";
import ErrorView from "@/components/ErrorView/ErrorView";

type FetchFn = (url: string, options?: RequestInit) => Promise<Response>;

type PinsBoardContainerProps = {
  queryKey: string[];
  fetchPinsAPIRoute: string;
  fetchFn?: FetchFn;
  emptyResultsMessageKey?: string;
  errorMessageKey?: string;
};

const PinsBoardContainer = ({
  queryKey,
  fetchPinsAPIRoute,
  fetchFn,
  emptyResultsMessageKey,
  errorMessageKey,
}: PinsBoardContainerProps) => {
  const { t } = useTranslation();

  const resolvedFetchFn: FetchFn = fetchFn ?? fetchPublic;

  const fetchPage = async ({ pageParam }: { pageParam: number }) => {
    const url =
      pageParam === 1
        ? fetchPinsAPIRoute
        : appendQueryParam({
            url: fetchPinsAPIRoute,
            key: "page",
            value: String(pageParam),
          });

    const response = await resolvedFetchFn(url);

    throwIfKO(response);

    const { results } = await response.json();

    return serializePinsWithAuthorDetails(results) as PinWithAuthorDetails[];
  };

  const {
    data,
    fetchNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    isFetchNextPageError,
  } = useInfiniteQuery({
    queryKey,
    queryFn: fetchPage,
    initialPageParam: 1,
    getNextPageParam: (_lastPage, allPages) => allPages.length + 1,
  });

  if (isLoading) {
    return <SpinnerBelowHeader />;
  }

  if (isError && !data) {
    const [ns, ...keyParts] = (errorMessageKey ?? "").split(".");
    const errorMessage = t(keyParts.join("."), { ns });
    return <ErrorView message={errorMessage} />;
  }

  const allPins = data?.pages.flat() ?? [];

  return (
    <PinsBoard
      pins={allPins}
      isFetching={isFetchingNextPage}
      fetchFailed={isFetchNextPageError}
      emptyResultsMessageKey={emptyResultsMessageKey}
      onScrolledToBottom={fetchNextPage}
    />
  );
};

export default PinsBoardContainer;
