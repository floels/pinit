import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { API_URL_SEARCH_SUGGESTIONS } from "@/lib/constants";
import { fetchPublic } from "@/lib/api/fetchers";
import HeaderSearchBar from "./HeaderSearchBar";
import { useHeaderSearchBarContext } from "@/contexts/headerSearchBarContext";

export const AUTOCOMPLETE_DEBOUNCE_TIME_MS = 300;

const getSuggestionsWithSearchTermAtTop = ({
  searchTerm,
  originalSuggestions,
}: {
  searchTerm: string;
  originalSuggestions: string[];
}) => {
  const MAX_SUGGESTIONS = 12;

  const isSearchTermIncludedInSuggestions =
    originalSuggestions.includes(searchTerm);

  if (isSearchTermIncludedInSuggestions) {
    // NB: normally the API returns 12 suggestions at most
    // so this `slice` is just for precaution.
    return originalSuggestions.slice(0, MAX_SUGGESTIONS);
  }

  // If search term is not present, add searchTerm as the first suggestion
  // (and drop the last suggestion received from the API):
  const remainingSuggestions = originalSuggestions.slice(
    0,
    MAX_SUGGESTIONS - 1,
  );

  return [searchTerm, ...remainingSuggestions];
};

// Returns an empty list for every failure: a request that fails must clear the
// suggestions of the previous search term.
const fetchSearchSuggestions = async (
  searchTerm: string,
): Promise<string[]> => {
  let response;

  try {
    response = await fetchPublic(
      `${API_URL_SEARCH_SUGGESTIONS}?search=${searchTerm.toLowerCase()}`,
    );
  } catch {
    return [];
  }

  if (!response.ok) {
    return [];
  }

  let responseData;

  try {
    responseData = await response.json();
  } catch {
    return [];
  }

  return getSuggestionsWithSearchTermAtTop({
    searchTerm,
    originalSuggestions: responseData.results,
  });
};

const HeaderSearchBarContainer = () => {
  const navigate = useNavigate();

  // The suggestions are stored together with the search term they were fetched
  // for. Suggestions for any other term, and for an empty input, read as empty.
  const [fetchedSuggestions, setFetchedSuggestions] = useState<{
    searchTerm: string;
    suggestions: string[];
  }>({ searchTerm: "", suggestions: [] });

  const {
    state: { inputValue, isInputFocused },
    dispatch,
  } = useHeaderSearchBarContext();

  const handleInputFocus = () => {
    dispatch({ type: "FOCUS_INPUT" });
  };

  const handleInputBlur = () => {
    dispatch({ type: "BLUR_INPUT" });
  };

  const getSuggestionLinkClickHandler = (suggestion: string) => {
    return () => {
      dispatch({ type: "SET_INPUT_VALUE", payload: suggestion }); // Theoretically
      // this shouldn't be necessary since the input's value is automatically
      // updated based on the route, but updating it here will give a better
      // impression of reactivity.

      navigate(`/search/pins?q=${suggestion}`);
    };
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({ type: "SET_INPUT_VALUE", payload: event.target.value });
  };

  const handlePressEscape = () => {
    dispatch({ type: "SET_INPUT_VALUE", payload: "" });
  };

  // The timeout of the Effect debounces the request: a new input value clears
  // the pending timeout before it schedules the next one.
  useEffect(() => {
    if (!inputValue) {
      return;
    }

    const timeoutId = setTimeout(async () => {
      const suggestions = await fetchSearchSuggestions(inputValue);

      setFetchedSuggestions({ searchTerm: inputValue, suggestions });
    }, AUTOCOMPLETE_DEBOUNCE_TIME_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [inputValue]);

  const handleClickClearIcon = () => {
    dispatch({ type: "SET_INPUT_VALUE", payload: "" });
    dispatch({ type: "BLUR_INPUT" });
  };

  const searchSuggestions =
    fetchedSuggestions.searchTerm === inputValue
      ? fetchedSuggestions.suggestions
      : [];

  return (
    <HeaderSearchBar
      inputValue={inputValue}
      isInputFocused={isInputFocused}
      onInputChange={handleInputChange}
      onInputFocus={handleInputFocus}
      onInputBlur={handleInputBlur}
      onClickClearIcon={handleClickClearIcon}
      onPressEscape={handlePressEscape}
      searchSuggestions={searchSuggestions}
      getSuggestionLinkClickHandler={getSuggestionLinkClickHandler}
    />
  );
};

export default HeaderSearchBarContainer;
