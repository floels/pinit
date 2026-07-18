import { NavigationProp } from "@react-navigation/native";
import { useRef, useState } from "react";
import { TextInput, View } from "react-native";

import styles from "./HomeScreen.styles";

import PinsSearchInputContainer from "@/src/components/PinsSearchInput/PinsSearchInputContainer";
import { SearchNavigatorParamList } from "@/src/navigators/SearchNavigator/SearchNavigator";

type SearchBaseScreenProps = {
  navigation: NavigationProp<SearchNavigatorParamList>;
};

const SearchBaseScreen = ({ navigation }: SearchBaseScreenProps) => {
  const searchInputRef = useRef<TextInput>(null);

  const [searchInputValue, setSearchInputValue] = useState("");
  const [isSearchInputFocused, setIsSearchInputFocused] = useState(false);

  const handleSearchInputFocus = () => {
    setIsSearchInputFocused(true);
  };

  const handlePressSearchInputCancel = () => {
    setSearchInputValue("");
    searchInputRef.current?.blur();
    setIsSearchInputFocused(false);
  };

  const handlePressSearchInputClear = () => {
    setSearchInputValue("");
  };

  const handleSearchInputSubmit = () => {
    navigation.navigate("Authenticated.Browse.Main.Search.Results", {
      searchTerm: searchInputValue,
    });
  };

  const getPressHandlerForSearchSuggestion =
    ({ suggestion }: { suggestion: string }) =>
    () => {
      navigation.navigate("Authenticated.Browse.Main.Search.Results", {
        searchTerm: suggestion,
      });
    };

  return (
    <View style={styles.container}>
      <PinsSearchInputContainer
        inputValue={searchInputValue}
        isInputFocused={isSearchInputFocused}
        withSearchIcon
        handleInputFocus={handleSearchInputFocus}
        handlePressCancel={handlePressSearchInputCancel}
        handlePressClear={handlePressSearchInputClear}
        handleInputChange={setSearchInputValue}
        handleSubmit={handleSearchInputSubmit}
        getPressHandlerForSuggestion={getPressHandlerForSearchSuggestion}
        ref={searchInputRef}
      />
    </View>
  );
};

export default SearchBaseScreen;
