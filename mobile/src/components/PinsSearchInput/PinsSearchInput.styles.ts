import { StyleSheet } from "react-native";

import { Colors, Fonts } from "@/src/global.styles";

const styles = StyleSheet.create({
  searchInputAndCancelButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInputAndIcons: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    flex: 1,
  },
  searchIcon: {
    color: Colors.fontSecondary,
    marginLeft: 12,
  },
  searchInput: {
    paddingLeft: 16,
    paddingTop: 10,
    paddingBottom: 10,
    flex: 1,
  },
  clearIcon: {
    marginRight: 12,
  },
  cancelButton: {
    marginLeft: 10,
  },
  cancelButtonText: {
    fontWeight: Fonts.fontWeightSemiBold,
  },
  suggestionsListContainer: {
    width: "100%",
  },
});

export default styles;
