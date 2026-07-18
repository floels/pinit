import { useSearchParams, Navigate } from "react-router-dom";
import { API_URL_SEARCH } from "@/lib/constants";
import PinsBoardContainer from "@/components/PinsBoard/PinsBoardContainer";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("q");

  if (!searchTerm) {
    return <Navigate to="/" replace />;
  }

  return (
    <PinsBoardContainer
      queryKey={["search", searchTerm]}
      fetchPinsAPIRoute={`${API_URL_SEARCH}?q=${searchTerm}`}
      errorMessageKey="PinsSearch.ERROR_FETCH_SEARCH_RESULTS"
      emptyResultsMessageKey="PinsSearch.NO_RESULTS"
    />
  );
};

export default SearchPage;
