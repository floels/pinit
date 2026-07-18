import { StyleSheet } from "react-native";

import { Colors } from "@/src/global.styles";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
  },
  spinnerIcon: {
    color: Colors.fontSecondary,
  },
});

export default styles;
