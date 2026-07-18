import { StyleSheet } from "react-native";

import { Colors, Fonts } from "@/src/global.styles";

const styles = StyleSheet.create({
  container: {
    paddingLeft: 16,
    paddingRight: 16,
    backgroundColor: Colors.backgroundBase,
    minHeight: 10000, // arbitrarily high number, so it covers all screen
  },
  suggestionContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 20,
  },
  suggestionIcon: {
    marginRight: 20,
  },
  suggestionText: {
    fontSize: Fonts.fontSize200,
  },
});

export default styles;
