import { useSearchParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, API_ENDPOINT_SEARCH_PINS, API_ROUTE_SEARCH } from "@/lib/constants";
import { throwIfKO } from "@/lib/utils/fetch";
import { serializePinsWithAuthorDetails } from "@/lib/utils/serializers";
import PinsBoardContainer from "@/components/PinsBoard/PinsBoardContainer";
import ErrorView from "@/components/ErrorView/ErrorView";
import SpinnerBelowHeader from "@/components/Spinners/SpinnerBelowHeader";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("q");

  const { data: initialPins, error, isLoading } = useQuery({
    queryKey: ["search", searchTerm],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/${API_ENDPOINT_SEARCH_PINS}?q=${searchTerm}`,
      );

      throwIfKO(response);

      return serializePinsWithAuthorDetails((await response.json()).results);
    },
    enabled: !!searchTerm,
  });

  if (!searchTerm) return <Navigate to="/" replace />;

  if (isLoading) return <SpinnerBelowHeader />;

  if (error) {
    return <ErrorView errorMessageKey="PinsSearch.ERROR_FETCH_SEARCH_RESULTS" />;
  }

  return (
    <PinsBoardContainer
      initialPins={initialPins!}
      fetchPinsAPIRoute={API_ROUTE_SEARCH}
      emptyResultsMessageKey="PinsSearch.NO_RESULTS"
    />
  );
};

export default SearchPage;
