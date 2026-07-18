import { StyleSheet } from "react-native";

import { Colors, Fonts } from "@/src/global.styles";

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
  },
  backgroundPictureImage: {
    height: 240,
  },
  profilePictureImage: {
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  profilePictureImageWithBackgroundPicture: {
    marginTop: -70,
    borderWidth: 2,
    borderColor: "white",
  },
  profilePictureImageWithoutBackgroundPicture: {
    marginTop: 80,
  },
  initialContainer: {
    marginTop: 80,
    alignItems: "center",
    justifyContent: "center",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.backgroundSecondary,
  },
  initial: {
    fontSize: Fonts.fontSize600,
  },
});

export default styles;
