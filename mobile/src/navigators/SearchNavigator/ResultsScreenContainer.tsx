import { NavigationProp, RouteProp } from "@react-navigation/native";
import { useRef, useState } from "react";
import { TextInput } from "react-native";

import ResultsScreen from "./ResultsScreen";
import { SearchNavigatorParamList } from "./SearchNavigator";

import { API_BASE_URL, API_ENDPOINT_SEARCH_PINS } from "@/src/lib/constants";
import { PinWithAuthorDetails } from "@/src/lib/types";

type SearchResultsBaseScreenContainerProps = {
  navigation: NavigationProp<SearchNavigatorParamList>;
  route: RouteProp<
    SearchNavigatorParamList,
    "Authenticated.Browse.Main.Search.Results"
  >;
  handlePressBack: () => void;
};

const ResultsScreenContainer = ({
  navigation,
  route,
  handlePressBack,
}: SearchResultsBaseScreenContainerProps) => {
  const initialSearchTerm = route.params.searchTerm;

  const searchInputRef = useRef<TextInput>(null);

  const [searchInputValue, setSearchInputValue] = useState(initialSearchTerm);
  const [lastSubmittedSearchTerm, setLastSubmittedSearchTerm] =
    useState(initialSearchTerm);
  const [isSearchInputFocused, setIsSearchInputFocused] = useState(false);

  const handleSearchInputFocus = () => {
    setIsSearchInputFocused(true);
  };

  const handlePressSearchInputCancel = () => {
    setSearchInputValue(lastSubmittedSearchTerm);
    searchInputRef.current?.blur();
    setIsSearchInputFocused(false);
  };

  const handlePressSearchInputClear = () => {
    setSearchInputValue("");
  };

  const handleSearchInputSubmit = () => {
    setLastSubmittedSearchTerm(searchInputValue);
    searchInputRef.current?.blur();
    setIsSearchInputFocused(false);
  };

  const getPressHandlerForSearchSuggestion =
    ({ suggestion }: { suggestion: string }) =>
    () => {
      setSearchInputValue(suggestion);
      setLastSubmittedSearchTerm(suggestion);
      searchInputRef.current?.blur();
      setIsSearchInputFocused(false);
    };

  const getTapHandlerForPin = ({
    pin,
    pinImageAspectRatio,
  }: {
    pin: PinWithAuthorDetails;
    pinImageAspectRatio: number;
  }) => {
    return () => {
      navigation.navigate("Authenticated.Browse.Main.Search.Pin", {
        pin,
        pinImageAspectRatio,
      });
    };
  };

  const searchEndpoint = `${API_BASE_URL}/${API_ENDPOINT_SEARCH_PINS}?q=${lastSubmittedSearchTerm.toLowerCase()}`;

  const showBackButton = !isSearchInputFocused;

  return (
    <ResultsScreen
      showBackButton={showBackButton}
      searchInputValue={searchInputValue}
      isSearchInputFocused={isSearchInputFocused}
      searchEndpoint={searchEndpoint}
      handlePressBack={handlePressBack}
      handleSearchInputFocus={handleSearchInputFocus}
      handlePressSearchInputCancel={handlePressSearchInputCancel}
      handlePressSearchInputClear={handlePressSearchInputClear}
      setSearchInputValue={setSearchInputValue}
      handleSearchInputSubmit={handleSearchInputSubmit}
      getPressHandlerForSearchSuggestion={getPressHandlerForSearchSuggestion}
      getTapHandlerForPin={getTapHandlerForPin}
      ref={searchInputRef}
    />
  );
};

export default ResultsScreenContainer;
