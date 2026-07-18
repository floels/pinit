import AsyncStorage from "@react-native-async-storage/async-storage";
import { render, waitFor } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";

import AccountDetailsFetcher from "./AccountDetailsFetcher";

import { AccountContext } from "@/src/contexts/accountContext";
import { AuthenticationContext } from "@/src/contexts/authenticationContext";
import {
  API_BASE_URL,
  API_ENDPOINT_MY_ACCOUNT_DETAILS,
  PROFILE_PICTURE_URL_STORAGE_KEY,
} from "@/src/lib/constants";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_JSON,
  MOCK_API_RESPONSES_SERIALIZED,
} from "@/src/lib/testing-utils/mockAPIResponses";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
}));

const mockAuthenticationContextDispatch = jest.fn();

const mockSetAccount = jest.fn();

const renderComponent = () => {
  const authenticationContextInitialState = {
    isCheckingAccessToken: false,
    isAuthenticated: true,
  };

  render(
    <AuthenticationContext.Provider
      value={{
        state: authenticationContextInitialState,
        dispatch: mockAuthenticationContextDispatch,
      }}
    >
      <AccountContext.Provider
        value={{ account: null, setAccount: mockSetAccount }}
      >
        <AccountDetailsFetcher />
      </AccountContext.Provider>
    </AuthenticationContext.Provider>,
  );
};

const accountDetailsEndpoint = `${API_BASE_URL}/${API_ENDPOINT_MY_ACCOUNT_DETAILS}`;

it(`calls 'setAccount' with proper arguments and persists 
relevant data upon successful fetch`, async () => {
  (SecureStore.getItemAsync as jest.Mock).mockImplementationOnce(
    () => "access_token",
  );

  fetchMock.mockOnceIf(
    accountDetailsEndpoint,
    MOCK_API_RESPONSES[API_ENDPOINT_MY_ACCOUNT_DETAILS],
  );

  renderComponent();

  await waitFor(() => {
    expect(mockSetAccount).toHaveBeenCalledWith(
      MOCK_API_RESPONSES_SERIALIZED[API_ENDPOINT_MY_ACCOUNT_DETAILS],
    );

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      PROFILE_PICTURE_URL_STORAGE_KEY,
      MOCK_API_RESPONSES_JSON[API_ENDPOINT_MY_ACCOUNT_DETAILS]
        .profile_picture_url,
    );
  });
});

it("dispatches relevant action upon 401 response", async () => {
  (SecureStore.getItemAsync as jest.Mock).mockImplementationOnce(
    () => "access_token",
  );

  fetchMock.mockOnceIf(accountDetailsEndpoint, "{}", {
    status: 401,
  });

  renderComponent();

  await waitFor(() => {
    expect(mockAuthenticationContextDispatch).toHaveBeenCalledWith({
      type: "GOT_401_RESPONSE",
    });
  });
});

it("fails silently upon other KO response", async () => {
  (SecureStore.getItemAsync as jest.Mock).mockImplementationOnce(
    () => "access_token",
  );

  fetchMock.mockOnceIf(accountDetailsEndpoint, "{}", {
    status: 400,
  });

  renderComponent();
});
