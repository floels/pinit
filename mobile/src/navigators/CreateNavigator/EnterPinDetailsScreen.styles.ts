import { StyleSheet } from "react-native";

import { Fonts, Colors } from "@/src/global.styles";

const styles = StyleSheet.create({
  container: {
    paddingTop: 80,
    alignItems: "center",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },
  backButton: {
    position: "absolute",
    left: 20,
  },
  title: {
    fontWeight: Fonts.fontWeightSemiBold,
    fontSize: Fonts.fontSize200,
  },
  pinImage: {
    borderRadius: 20,
  },
  pinTitleLabelAndInput: {
    marginTop: 20,
    marginBottom: 40,
    paddingLeft: 20,
    paddingRight: 20,
    width: "100%",
  },
  formLabel: {
    marginBottom: 10,
  },
  pinTitleInput: {
    fontSize: Fonts.fontSize300,
    fontWeight: Fonts.fontWeightSemiBold,
  },
  pinDescriptionLabelAndInput: {
    marginTop: 20,
    marginBottom: 40,
    paddingLeft: 20,
    paddingRight: 20,
    width: "100%",
  },
  submitButtonContainer: {
    width: "100%",
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    paddingBottom: 40,
  },
  submitButton: {
    backgroundColor: Colors.backgroundImportant,
    padding: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  submitButtonText: {
    color: Colors.fontImportant,
    fontWeight: Fonts.fontWeightSemiBold,
  },
});

export default styles;
