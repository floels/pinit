import { StyleSheet } from "react-native";

import { Colors, Fonts } from "@/src/global.styles";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  overlay: {
    flex: 1,
  },
  modal: {
    backgroundColor: Colors.backgroundBase,
    paddingTop: 20,
    paddingBottom: 40,
    position: "absolute",
    bottom: 0,
    width: "100%",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: "center",
  },
  closeButtonAndTitle: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  closeButton: {
    marginLeft: 20,
  },
  title: {
    marginLeft: 40,
    fontWeight: Fonts.fontWeightSemiBold,
  },
  createPinButton: {
    alignItems: "center",
  },
  createPinIconContainer: {
    padding: 30,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 20,
    marginBottom: 10,
  },
});

export default styles;
