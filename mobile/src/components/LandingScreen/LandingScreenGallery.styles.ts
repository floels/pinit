import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    width: "100%",
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  imageColumn: {
    width: "30%",
  },
  image: {
    width: "100%",
    // A percentage width gives the image no intrinsic height, so pin it with an
    // aspect ratio (width / height); 0.7 keeps the pins portrait-oriented.
    aspectRatio: 0.7,
    resizeMode: "cover",
    marginBottom: 10,
    borderRadius: 20,
  },
});

export default styles;
