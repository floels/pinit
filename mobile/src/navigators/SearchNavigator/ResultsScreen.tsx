import { Ref, forwardRef } from "react";
import { View, TouchableOpacity, TextInput } from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

import styles from "./ResultsScreen.styles";

import PinsBoardContainer from "@/src/components/PinsBoard/PinsBoardContainer";
import PinsSearchInputContainer from "@/src/components/PinsSearchInput/PinsSearchInputContainer";
import { PinWithAuthorDetails } from "@/src/lib/types";

type ResultsScreenProps = {
  showBackButton: boolean;
  searchInputValue: string;
  isSearchInputFocused: boolean;
  searchEndpoint: string;
  handlePressBack: () => void;
  handleSearchInputFocus: () => void;
  handlePressSearchInputCancel: () => void;
  handlePressSearchInputClear: () => void;
  setSearchInputValue: (newValue: string) => void;
  handleSearchInputSubmit: () => void;
  getPressHandlerForSearchSuggestion: ({
    suggestion,
  }: {
    suggestion: string;
  }) => () => void;
  getTapHandlerForPin: ({
    pin,
    pinImageAspectRatio,
  }: {
    pin: PinWithAuthorDetails;
    pinImageAspectRatio: number;
  }) => () => void;
};

const ResultsScreen = forwardRef(
  (props: ResultsScreenProps, ref: Ref<TextInput>) => {
    const {
      showBackButton,
      searchInputValue,
      isSearchInputFocused,
      searchEndpoint,
      handlePressBack,
      handleSearchInputFocus,
      handlePressSearchInputCancel,
      handlePressSearchInputClear,
      setSearchInputValue,
      handleSearchInputSubmit,
      getPressHandlerForSearchSuggestion,
      getTapHandlerForPin,
    } = props;

    return (
      <View style={styles.container}>
        <View style={styles.backButtonAndSearchInput}>
          {showBackButton && (
            <TouchableOpacity
              onPress={handlePressBack}
              style={styles.backButton}
            >
              <FontAwesome5Icon name="chevron-left" size={20} />
            </TouchableOpacity>
          )}
          <View style={styles.searchInputContainer}>
            <PinsSearchInputContainer
              inputValue={searchInputValue}
              isInputFocused={isSearchInputFocused}
              handleInputFocus={handleSearchInputFocus}
              handlePressCancel={handlePressSearchInputCancel}
              handlePressClear={handlePressSearchInputClear}
              handleInputChange={setSearchInputValue}
              handleSubmit={handleSearchInputSubmit}
              getPressHandlerForSuggestion={getPressHandlerForSearchSuggestion}
              ref={ref}
            />
          </View>
        </View>
        <PinsBoardContainer
          fetchEndpoint={searchEndpoint}
          getTapHandlerForPin={getTapHandlerForPin}
          emptyResultsMessageKey="SearchScreen.NO_RESULTS"
        />
      </View>
    );
  },
);

export default ResultsScreen;
