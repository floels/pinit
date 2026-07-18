import { render } from "@testing-library/react-native";

import LandingScreenContent from "./LandingScreenContent";

it("renders", () => {
  render(<LandingScreenContent handlePressLogIn={() => {}} />); // NB: the
  // behavior upon pressing the 'Log in' button is tested in the
  // <LandingScreen /> parent component.
});
