import { StyleSheet } from "react-native";

import { Fonts } from "@/src/global.styles";

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  image: {
    borderRadius: 16,
    marginBottom: 4,
  },
  title: {
    fontSize: Fonts.fontSize100,
    fontWeight: Fonts.fontWeightSemiBold,
    marginBottom: 4,
  },
  authorData: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorProfilePicture: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  authorName: {
    fontSize: Fonts.fontSize100,
  },
});

export default styles;
