import { useEffect, useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { API_BASE_URL, API_ENDPOINT_SEARCH_PINS, API_ROUTE_SEARCH } from "@/lib/constants";
import { throwIfKO } from "@/lib/utils/fetch";
import { serializePinsWithAuthorDetails } from "@/lib/utils/serializers";
import { PinWithAuthorDetails } from "@/lib/types/frontendTypes";
import PinsBoardContainer from "@/components/PinsBoard/PinsBoardContainer";
import ErrorView from "@/components/ErrorView/ErrorView";
import SpinnerBelowHeader from "@/components/Spinners/SpinnerBelowHeader";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("q");

  const [initialPins, setInitialPins] = useState<PinWithAuthorDetails[] | null>(
    null,
  );
  const [fetchFailed, setFetchFailed] = useState(false);

  useEffect(() => {
    if (!searchTerm) return;

    setInitialPins(null);
    setFetchFailed(false);

    const fetchResults = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/${API_ENDPOINT_SEARCH_PINS}?q=${searchTerm}`,
        );

        throwIfKO(response);

        const data = await response.json();
        setInitialPins(serializePinsWithAuthorDetails(data.results));
      } catch {
        setFetchFailed(true);
      }
    };

    fetchResults();
  }, [searchTerm]);

  if (!searchTerm) {
    return <Navigate to="/" replace />;
  }

  if (fetchFailed) {
    return <ErrorView errorMessageKey="PinsSearch.ERROR_FETCH_SEARCH_RESULTS" />;
  }

  if (!initialPins) {
    return <SpinnerBelowHeader />;
  }

  return (
    <PinsBoardContainer
      initialPins={initialPins}
      fetchPinsAPIRoute={API_ROUTE_SEARCH}
      emptyResultsMessageKey="PinsSearch.NO_RESULTS"
    />
  );
};

export default SearchPage;
