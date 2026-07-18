import { StyleSheet } from "react-native";

import { Colors, Fonts } from "@/src/global.styles";

const styles = StyleSheet.create({
  container: {
    paddingTop: 80,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 40,
    marginBottom: 40,
  },
  closeButton: {
    marginLeft: 20,
  },
  nextButton: {
    backgroundColor: Colors.backgroundImportant,
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  nextButtonText: {
    color: Colors.fontImportant,
    fontWeight: Fonts.fontWeightSemiBold,
  },
});

export default styles;
