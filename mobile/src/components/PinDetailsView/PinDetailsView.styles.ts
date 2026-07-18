import { StyleSheet } from "react-native";

import { Colors, Fonts } from "@/src/global.styles";

export const SIDE_PADDING = 6;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingLeft: SIDE_PADDING,
    paddingRight: SIDE_PADDING,
    backgroundColor: "black",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    zIndex: 10,
    top: 40,
    left: 26,
  },
  backButtonIcon: {
    color: Colors.fontImportant,
  },
  content: {
    minHeight: "100%", // For some reason setting 'flex: 1' here doesn't
    // allow to cover the whole bottom of the screen with a white
    // background, in the cases where the pin's content is less than the
    // screen's height.
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: Colors.backgroundBase,
    paddingBottom: 80,
  },
  pinData: {
    marginTop: 20,
    padding: 20,
  },
  pinImage: {
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  authorData: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorName: {
    fontSize: Fonts.fontSize300,
    fontWeight: Fonts.fontWeightSemiBold,
  },
  authorProfilePictureImage: {
    height: 40,
    width: 40,
    borderRadius: 20,
    marginRight: 16,
  },
  pinTitle: {
    marginTop: 10,
    fontSize: Fonts.fontSize300,
    fontWeight: Fonts.fontWeightSemiBold,
  },
  pinDescription: {
    marginTop: 6,
    fontSize: Fonts.fontSize200,
  },
});

export default styles;
