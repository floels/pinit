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
    //width: "100%",
    resizeMode: "cover",
    marginBottom: 10,
    borderRadius: 20,
  },
});

export default styles;
