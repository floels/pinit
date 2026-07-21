import AsyncStorage from "@react-native-async-storage/async-storage";
import { render, screen, waitFor } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";

import NavigationContainer from "./NavigationContainer";

import { AuthenticationContextProvider } from "@/src/contexts/authenticationContext";
import { ACCESS_TOKEN_STORAGE_KEY } from "@/src/lib/constants";

// Far enough in the future that the gate won't try to refresh the token.
const DISTANT_EXPIRATION_DATE = "2999-01-01T00:00:00Z";

jest.mock("expo-secure-store");

jest.mock(
  "@/src/navigators/AuthenticatedNavigator/AuthenticatedNavigator",
  () => {
    const View = jest.requireActual("react-native").View;

    return () => <View testID="mocked-authenticated-navigator" />;
  },
);

jest.mock(
  "@/src/navigators/UnauthenticatedNavigator/UnauthenticatedNavigator",
  () => {
    const View = jest.requireActual("react-native").View;

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

beforeEach(() => {
  fetchMock.resetMocks();
  (SecureStore.getItemAsync as jest.Mock).mockReset();
  (SecureStore.deleteItemAsync as jest.Mock).mockReset();
  (AsyncStorage.getItem as jest.Mock).mockReset();
});

it("renders authenticated navigator when a fresh access token is found", async () => {
  (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("access-token");
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
    DISTANT_EXPIRATION_DATE,
  );

  renderComponent();

  await waitFor(() => {
    screen.getByTestId("mocked-authenticated-navigator");
  });
});

it("refreshes an expiring access token before entering the authenticated tree", async () => {
  (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("token"); // access + refresh present
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null); // no expiration -> refresh
  fetchMock.mockResponseOnce(
    JSON.stringify({
      access_token: "refreshed-access-token",
      access_token_expiration_utc: DISTANT_EXPIRATION_DATE,
    }),
  );

  renderComponent();

  await waitFor(() => {
    screen.getByTestId("mocked-authenticated-navigator");
  });
  expect(fetch).toHaveBeenCalled(); // the refresh request was made
});

it("clears stored tokens and shows login when the token can't be refreshed", async () => {
  // Access token present but no refresh token, and no expiration -> must refresh
  // but can't, so the session is dead.
  (SecureStore.getItemAsync as jest.Mock).mockImplementation((key: string) =>
    Promise.resolve(key === ACCESS_TOKEN_STORAGE_KEY ? "stale-access" : null),
  );
  (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

  renderComponent();

  await waitFor(() => {
    screen.getByTestId("mocked-unauthenticated-navigator");
  });
  expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
    ACCESS_TOKEN_STORAGE_KEY,
  );
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
