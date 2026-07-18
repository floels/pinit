import { render, screen, waitFor } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";

import NavigationContainer from "./NavigationContainer";

import { AuthenticationContextProvider } from "@/src/contexts/authenticationContext";

jest.mock("expo-secure-store");

jest.mock(
  "@/src/navigators/AuthenticatedNavigator/AuthenticatedNavigator",
  () => {
    const View = jest.requireActual(
      "react-native/Libraries/Components/View/View",
    );

    return () => <View testID="mocked-authenticated-navigator" />;
  },
);

jest.mock(
  "@/src/navigators/UnauthenticatedNavigator/UnauthenticatedNavigator",
  () => {
    const View = jest.requireActual(
      "react-native/Libraries/Components/View/View",
    );

    return () => <View testID="mocked-unauthenticated-navigator" />;
  },
);

const renderComponent = () => {
  render(
    <AuthenticationContextProvider>
      <NavigationContainer />
    </AuthenticationContextProvider>,
  );
};

it("renders authenticated navigator when an access token is found", async () => {
  (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("access-token");

  renderComponent();

  await waitFor(() => {
    screen.getByTestId("mocked-authenticated-navigator");
  });
});

it("renders unauthenticated navigator when no access token is found", async () => {
  (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

  renderComponent();

  await waitFor(() => {
    screen.getByTestId("mocked-unauthenticated-navigator");
  });
});

it("renders unauthenticated navigator when getting on error upon access token read", async () => {
  (SecureStore.getItemAsync as jest.Mock).mockRejectedValue(new Error());

  renderComponent();

  await waitFor(() => {
    screen.getByTestId("mocked-unauthenticated-navigator");
  });
});
