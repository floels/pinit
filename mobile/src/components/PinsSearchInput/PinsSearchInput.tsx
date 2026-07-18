import { Ref, forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { View, TouchableOpacity, Text, TextInput } from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

import styles from "./PinsSearchInput.styles";
import SearchSuggestionsList from "./SearchSuggestionsList";

type PinsSearchInputProps = {
  inputValue: string;
  showSearchIcon: boolean;
  showClearIcon: boolean;
  showCancelButton: boolean;
  suggestions: string[];
  showSuggestions: boolean;
  handleInputFocus: () => void;
  handleInputChange: (value: string) => void;
  handlePressClear: () => void;
  handlePressCancel: () => void;
  handleSubmit: () => void;
  getPressHandlerForSuggestion: ({
    suggestion,
  }: {
    suggestion: string;
  }) => () => void;
};

const PinsSearchInput = forwardRef(
  (props: PinsSearchInputProps, ref: Ref<TextInput>) => {
    const {
      inputValue,
      showSearchIcon,
      showClearIcon,
      showCancelButton,
      suggestions,
      showSuggestions,
      handleInputFocus,
      handleInputChange,
      handlePressClear,
      handlePressCancel,
      handleSubmit,
      getPressHandlerForSuggestion,
    } = props;

    const { t } = useTranslation();

    return (
      <View>
        <View style={styles.searchInputAndCancelButton}>
          <View style={styles.searchInputAndIcons}>
            {showSearchIcon && (
              <View testID="pins-search-input-search-icon">
                <FontAwesome5Icon
                  name="search"
                  size={16}
                  style={styles.searchIcon}
                />
              </View>
            )}
            <TextInput
              value={inputValue}
              placeholder={t("SearchScreen.PINS_SEARCH_INPUT_PLACEHOLDER")}
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={handleInputFocus}
              onChangeText={handleInputChange}
              onSubmitEditing={handleSubmit}
              style={styles.searchInput}
              testID="pins-search-input-text-input"
              ref={ref}
            />
            {showClearIcon && (
              <TouchableOpacity
                onPress={handlePressClear}
                style={styles.clearIcon}
                testID="pins-search-input-clear-icon"
              >
                <FontAwesome5Icon name="times-circle" size={16} solid />
              </TouchableOpacity>
            )}
          </View>
          {showCancelButton && (
            <TouchableOpacity
              onPress={handlePressCancel}
              style={styles.cancelButton}
              testID="pins-search-input-cancel-button"
            >
              <Text style={styles.cancelButtonText}>
                {t("SearchScreen.CANCEL_SEARCH_INPUT")}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {showSuggestions && (
          <View style={styles.suggestionsListContainer}>
            <SearchSuggestionsList
              suggestions={suggestions}
              getPressHandlerForSuggestion={getPressHandlerForSuggestion}
            />
          </View>
        )}
      </View>
    );
  },
);

export default PinsSearchInput;
