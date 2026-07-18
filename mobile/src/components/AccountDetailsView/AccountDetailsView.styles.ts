import { StyleSheet } from "react-native";

import { Colors, Fonts } from "@/src/global.styles";

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    position: "relative",
    flex: 1,
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
    zIndex: 1,
  },
  backButtonIconWithBackgroundPicture: {
    color: "white",
  },
  loadingOrErrorStateContainer: {
    flex: 1,
    paddingTop: 60,
    paddingLeft: 20,
    paddingRight: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  spinnerIcon: {
    color: Colors.fontSecondary,
  },
  errorIcon: {
    color: Colors.fontWarning,
    marginBottom: 20,
  },
  errorText: {
    color: Colors.fontWarning,
    textAlign: "center",
  },
  accountData: {
    padding: 20,
    alignItems: "center",
  },
  displayName: {
    fontSize: Fonts.fontSize400,
    fontWeight: Fonts.fontWeightSemiBold,
    marginTop: 10,
  },
  description: {
    marginTop: 10,
  },
  logoAndUsername: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  logo: {
    marginRight: 6,
  },
  username: {
    color: Colors.fontSecondary,
  },
});

export default styles;
