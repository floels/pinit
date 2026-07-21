import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";
import { ReactNode } from "react";

import { useMyAccountDetails } from "./useMyAccountDetails";

import { AccountContext } from "@/src/contexts/accountContext";
import { AuthenticationContext } from "@/src/contexts/authenticationContext";
import {
  API_BASE_URL,
  API_ENDPOINT_MY_ACCOUNT_DETAILS,
  API_ENDPOINT_REFRESH_TOKEN,
  PROFILE_PICTURE_URL_STORAGE_KEY,
} from "@/src/lib/constants";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_JSON,
  MOCK_API_RESPONSES_SERIALIZED,
} from "@/src/lib/testing-utils/mockAPIResponses";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(() => Promise.resolve("access_token")),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const accountDetailsEndpoint = `${API_BASE_URL}/${API_ENDPOINT_MY_ACCOUNT_DETAILS}`;
const refreshTokenEndpoint = `${API_BASE_URL}/${API_ENDPOINT_REFRESH_TOKEN}`;

const mockDispatch = jest.fn();
const mockSetAccount = jest.fn();

const renderUseMyAccountDetails = () => {
  const queryClient = new QueryClient({
    // gcTime: 0 so the query cache doesn't leave a lingering timer that keeps
    // the jest process alive after the test finishes.
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <AuthenticationContext.Provider
        value={{
          state: { isCheckingAccessToken: false, isAuthenticated: true },
          dispatch: mockDispatch,
        }}
      >
        <AccountContext.Provider
          value={{ account: null, setAccount: mockSetAccount }}
        >
          {children}
        </AccountContext.Provider>
      </AuthenticationContext.Provider>
    </QueryClientProvider>
  );

  return renderHook(() => useMyAccountDetails(), { wrapper });
};

beforeEach(() => {
  fetchMock.resetMocks();
  mockDispatch.mockReset();
  mockSetAccount.mockReset();
  (AsyncStorage.setItem as jest.Mock).mockReset();
  (SecureStore.getItemAsync as jest.Mock).mockClear();
  (SecureStore.setItemAsync as jest.Mock).mockReset();
  (SecureStore.deleteItemAsync as jest.Mock).mockReset();
});

it("sets the account and caches the profile picture upon successful fetch", async () => {
  fetchMock.mockOnceIf(
    accountDetailsEndpoint,
    MOCK_API_RESPONSES[API_ENDPOINT_MY_ACCOUNT_DETAILS],
  );

  renderUseMyAccountDetails();

  await waitFor(() => {
    expect(mockSetAccount).toHaveBeenCalledWith(
      MOCK_API_RESPONSES_SERIALIZED[API_ENDPOINT_MY_ACCOUNT_DETAILS],
    );
  });
  expect(AsyncStorage.setItem).toHaveBeenCalledWith(
    PROFILE_PICTURE_URL_STORAGE_KEY,
    MOCK_API_RESPONSES_JSON[API_ENDPOINT_MY_ACCOUNT_DETAILS]
      .profile_picture_url,
  );
});

it("refreshes the token and retries without logging out upon a recoverable 401", async () => {
  let accountCallCount = 0;

  fetchMock.mockResponse(async (request) => {
    if (request.url === refreshTokenEndpoint) {
      return JSON.stringify({
        access_token: "new_access_token",
        access_token_expiration_utc: "2099-01-01T00:00:00Z",
      });
    }

    // The account-details endpoint rejects the stale token once, then succeeds
    // on the retry with the freshly refreshed token.
    accountCallCount += 1;

    if (accountCallCount === 1) {
      return { status: 401, body: "{}" };
    }

    return MOCK_API_RESPONSES[API_ENDPOINT_MY_ACCOUNT_DETAILS];
  });

  renderUseMyAccountDetails();

  await waitFor(() => {
    expect(mockSetAccount).toHaveBeenCalledWith(
      MOCK_API_RESPONSES_SERIALIZED[API_ENDPOINT_MY_ACCOUNT_DETAILS],
    );
  });
  // The recoverable 401 must not have logged the user out, and the refreshed
  // access token must have been persisted:
  expect(mockDispatch).not.toHaveBeenCalledWith({ type: "GOT_401_RESPONSE" });
  expect(SecureStore.setItemAsync).toHaveBeenCalled();
});

it("clears stored auth data and logs out when a 401 cannot be recovered", async () => {
  // Both the account fetch and the subsequent refresh return 401, so the
  // session is genuinely dead and the user should be logged out.
  fetchMock.mockResponse("{}", { status: 401 });

  renderUseMyAccountDetails();

  await waitFor(() => {
    expect(mockDispatch).toHaveBeenCalledWith({ type: "GOT_401_RESPONSE" });
  });
  expect(SecureStore.deleteItemAsync).toHaveBeenCalled();
});

it("does not log out upon a non-401 error", async () => {
  fetchMock.mockOnceIf(accountDetailsEndpoint, "{}", { status: 400 });

  const { result } = renderUseMyAccountDetails();

  await waitFor(() => {
    expect(result.current.isError).toBe(true);
  });
  expect(mockDispatch).not.toHaveBeenCalled();
});
