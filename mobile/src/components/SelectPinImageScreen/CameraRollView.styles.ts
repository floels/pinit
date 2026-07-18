import { StyleSheet } from "react-native";

export const SPACE_BETWEEN_COLUMNS = 1;

const styles = StyleSheet.create({
  image: {
    marginBottom: 1,
  },
  imageNotInLastColumn: {
    marginRight: SPACE_BETWEEN_COLUMNS,
  },
  selectedImageOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default styles;
