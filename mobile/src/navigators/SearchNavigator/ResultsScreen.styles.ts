import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    paddingTop: 130,
    paddingLeft: 6,
    paddingRight: 6,
  },
  backButtonAndSearchInput: {
    position: "absolute",
    top: 80,
    left: 6, // to match the paddingLeft of the parent
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10, // so that the search suggestions overlay the search results
  },
  backButton: {
    marginLeft: 10,
    marginRight: 10,
  },
  searchInputContainer: {
    flex: 1,
  },
});

export default styles;
