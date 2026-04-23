import { useSearchParams, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, API_ENDPOINT_SEARCH_PINS, API_URL_SEARCH } from "@/lib/constants";
import { throwIfKO } from "@/lib/utils/fetch";
import { serializePinsWithAuthorDetails } from "@/lib/utils/serializers";
import PinsBoardContainer from "@/components/PinsBoard/PinsBoardContainer";
import ErrorView from "@/components/ErrorView/ErrorView";
import SpinnerBelowHeader from "@/components/Spinners/SpinnerBelowHeader";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("q");

  const fetchSearchResults = async () => {
    const url = `${API_BASE_URL}/${API_ENDPOINT_SEARCH_PINS}?q=${searchTerm}`;

    const response = await fetch(url);

    throwIfKO(response);

    const responseData = await response.json();

    return serializePinsWithAuthorDetails(responseData.results);
  };

  const { data: initialPins, error, isLoading } = useQuery({
    queryKey: ["search", searchTerm],
    queryFn: fetchSearchResults,
    enabled: !!searchTerm,
  });

  if (!searchTerm) {
    return <Navigate to="/" replace />;
  }

  if (isLoading) {
    return <SpinnerBelowHeader />;
  }

  if (error) {
    return <ErrorView errorMessageKey="PinsSearch.ERROR_FETCH_SEARCH_RESULTS" />;
  }

  return (
    <PinsBoardContainer
      initialPins={initialPins!}
      fetchPinsAPIRoute={API_URL_SEARCH}
      emptyResultsMessageKey="PinsSearch.NO_RESULTS"
    />
  );
};

export default SearchPage;
