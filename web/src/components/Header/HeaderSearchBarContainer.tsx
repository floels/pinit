import { useEffect, useState } from "react";
import debounce from "lodash/debounce";
import { useNavigate } from "react-router";
import { API_URL_SEARCH_SUGGESTIONS } from "@/lib/constants";
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

  const fetchSearchSuggestions = async ({
    searchTerm,
  }: {
    searchTerm: string;
  }) => {
    let response;

    try {
      response = await fetch(
        `${API_URL_SEARCH_SUGGESTIONS}?search=${searchTerm.toLowerCase()}`,
      );
    } catch {
      setFetchedSuggestions({ searchTerm, suggestions: [] });
      return;
    }

    if (!response.ok) {
      setFetchedSuggestions({ searchTerm, suggestions: [] });
      return;
    }

    let responseData;

    try {
      responseData = await response.json();
    } catch {
      setFetchedSuggestions({ searchTerm, suggestions: [] });
      return;
    }

    const suggestionsWithSearchTermAtTop = getSuggestionsWithSearchTermAtTop({
      searchTerm,
      originalSuggestions: responseData.results,
    });

    setFetchedSuggestions({
      searchTerm,
      suggestions: suggestionsWithSearchTermAtTop,
    });
  };

  const debouncedFetchSearchSuggestions = debounce(
    fetchSearchSuggestions,
    AUTOCOMPLETE_DEBOUNCE_TIME_MS,
  );

  useEffect(() => {
    if (!inputValue) {
      return;
    }

    debouncedFetchSearchSuggestions({ searchTerm: inputValue });

    return () => {
      debouncedFetchSearchSuggestions.cancel();
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
