import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    position: "relative", // because the container of <LandingScreenGallery /> will have 'position: absolute;'
  },
});

export default styles;
