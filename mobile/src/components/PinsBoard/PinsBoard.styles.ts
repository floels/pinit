import { StyleSheet } from "react-native";

import { Colors } from "@/src/global.styles";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
  },
  contentContainer: {
    alignItems: "center",
    width: "100%",
  },
  refreshSpinnerPreview: {
    position: "absolute",
  },
  thumbnailsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  refreshSpinnerPreviewIcon: {
    color: Colors.fontSecondary,
  },
  refreshSpinnerIcon: {
    color: Colors.fontSecondary,
  },
  fetchMorePinsSpinner: {
    marginTop: 60,
    marginBottom: 60,
  },
  fetchMorePinsSpinnerIcon: {
    color: Colors.fontSecondary,
  },
  error: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 20,
    paddingRight: 20,
    marginTop: 20,
  },
  errorIcon: {
    color: Colors.fontWarning,
    marginRight: 6,
  },
  errorText: {
    textAlign: "center",
    color: Colors.fontWarning,
  },
});

export default styles;
