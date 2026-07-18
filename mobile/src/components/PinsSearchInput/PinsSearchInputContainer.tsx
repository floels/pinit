import debounce from "lodash/debounce";
import { Ref, forwardRef, useEffect, useState } from "react";
import { TextInput } from "react-native";

import PinsSearchInput from "./PinsSearchInput";

import {
  API_BASE_URL,
  API_ENDPOINT_SEARCH_SUGGESTIONS,
} from "@/src/lib/constants";

type PinsSearchInputContainerProps = {
  inputValue: string;
  isInputFocused: boolean;
  withSearchIcon?: boolean;
  handleInputFocus: () => void;
  handlePressCancel: () => void;
  handlePressClear: () => void;
  handleInputChange: (newValue: string) => void;
  handleSubmit: () => void;
  getPressHandlerForSuggestion: ({
    suggestion,
  }: {
    suggestion: string;
  }) => () => void;
};

const MAX_SUGGESTIONS_TO_RENDER = 12;
export const AUTOCOMPLETE_DEBOUNCE_TIME_MS = 300;

const getSuggestionsWithSearchTermAtTop = ({
  searchTerm,
  suggestionsReceivedFromAPI,
}: {
  searchTerm: string;
  suggestionsReceivedFromAPI: string[];
}) => {
  const isSearchTermIncludedInSuggestions =
    suggestionsReceivedFromAPI.includes(searchTerm);

  if (isSearchTermIncludedInSuggestions) {
    // NB: normally the API returns 12 suggestions at most
    // so this `slice` is just for precaution.
    return suggestionsReceivedFromAPI.slice(0, MAX_SUGGESTIONS_TO_RENDER);
  }

  // If search term is not present, add searchTerm as the first suggestion
  // (and drop the last suggestion received from the API):
  const remainingOriginalSuggestions = suggestionsReceivedFromAPI.slice(
    0,
    MAX_SUGGESTIONS_TO_RENDER - 1,
  );

  return [searchTerm, ...remainingOriginalSuggestions];
};

const PinsSearchInputContainer = forwardRef(
  (props: PinsSearchInputContainerProps, ref: Ref<TextInput>) => {
    const {
      inputValue,
      isInputFocused,
      withSearchIcon,
      handleInputFocus,
      handlePressCancel,
      handlePressClear,
      handleInputChange,
      handleSubmit,
      getPressHandlerForSuggestion,
    } = props;

    const [suggestions, setSuggestions] = useState<string[]>([]);

    const showSearchIcon =
      !!withSearchIcon && !isInputFocused && inputValue === "";
    const showClearIcon = isInputFocused && inputValue !== "";

    const fetchSearchSuggestions = async () => {
      let response;

      try {
        response = await fetch(
          `${API_BASE_URL}/${API_ENDPOINT_SEARCH_SUGGESTIONS}?search=${inputValue.toLowerCase()}`,
        );
      } catch {
        setSuggestions([]);
        return;
      }

      if (!response.ok) {
        setSuggestions([]);
        return;
      }

      let responseData;

      try {
        responseData = await response.json();
      } catch {
        setSuggestions([]);
        return;
      }

      const suggestionsReceivedFromAPI = responseData.results;

      const suggestionsWithSearchTermAtTop = getSuggestionsWithSearchTermAtTop({
        searchTerm: inputValue,
        suggestionsReceivedFromAPI,
      });

      setSuggestions(suggestionsWithSearchTermAtTop);
    };

    const debouncedFetchSearchSuggestions = debounce(
      fetchSearchSuggestions,
      AUTOCOMPLETE_DEBOUNCE_TIME_MS,
    );

    useEffect(() => {
      if (!inputValue) {
        setSuggestions([]);
        return;
      }

      debouncedFetchSearchSuggestions();

      return () => {
        debouncedFetchSearchSuggestions.cancel();
      };
    }, [inputValue]);

    return (
      <PinsSearchInput
        inputValue={inputValue}
        showSearchIcon={showSearchIcon}
        showClearIcon={showClearIcon}
        showCancelButton={isInputFocused}
        suggestions={suggestions}
        showSuggestions={isInputFocused}
        handleInputFocus={handleInputFocus}
        handlePressCancel={handlePressCancel}
        handlePressClear={handlePressClear}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        getPressHandlerForSuggestion={getPressHandlerForSuggestion}
        ref={ref}
      />
    );
  },
);

export default PinsSearchInputContainer;
