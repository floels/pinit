import { StyleSheet } from "react-native";

import { Colors } from "@/src/global.styles";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: Colors.backgroundSecondary,
    overflow: "hidden",
  },
  animatedGlaze: {
    flexDirection: "row",
    alignItems: "stretch",
    width: "20%",
    height: "100%",
  },
  gradientLeft: {
    flex: 1,
  },
  gradientRight: {
    flex: 1,
  },
});

export default styles;
