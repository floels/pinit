import AsyncStorage from "@react-native-async-storage/async-storage";
import { render, waitFor } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";

import AccessTokenRefresher, {
  TOKEN_REFRESH_BUFFER_BEFORE_EXPIRATION_MS,
} from "./AccessTokenRefresher";

import {
  ACCESS_TOKEN_EXPIRATION_DATE_STORAGE_KEY,
  ACCESS_TOKEN_STORAGE_KEY,
  API_BASE_URL,
  API_ENDPOINT_REFRESH_TOKEN,
} from "@/src/lib/constants";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_JSON,
} from "@/src/lib/testing-utils/mockAPIResponses";

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
}));

const refreshEndpoint = `${API_BASE_URL}/${API_ENDPOINT_REFRESH_TOKEN}`;

const mockHandledFinishedFetching = jest.fn();

const renderComponent = () => {
  render(
    <AccessTokenRefresher
      handleFinishedFetching={mockHandledFinishedFetching}
    />,
  );
};

beforeEach(() => {
  fetchMock.resetMocks();
  mockHandledFinishedFetching.mockReset();
});

it(`does not refresh the access token if the expiration date 
is after the cutoff, and calls 'hasFinishedFetching'`, async () => {
  const nowTime = new Date().getTime();

  const accessTokenExpirationDate = new Date(
    nowTime + 2 * TOKEN_REFRESH_BUFFER_BEFORE_EXPIRATION_MS,
  );

  (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(() =>
    accessTokenExpirationDate.toISOString(),
  );

  renderComponent();

  await new Promise((resolve) => setTimeout(resolve, 1)); // Without this wait,
  // the following assertion would be inoperative, meaning it would
  // pass even if there was a bug that led the component to fetch.

  expect(fetch).not.toHaveBeenCalled();

  expect(mockHandledFinishedFetching).toHaveBeenCalledTimes(1);
});

it(`fetches a refreshed access token if the expiration date 
is absent, persists the relevant data and calls 'hasFinishedFetching'
upon successful response`, async () => {
  (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(() => null);
  (SecureStore.getItemAsync as jest.Mock).mockImplementationOnce(
    () => "refresh_token",
  );

  fetchMock.mockOnceIf(
    refreshEndpoint,
    MOCK_API_RESPONSES[API_ENDPOINT_REFRESH_TOKEN],
  );

  renderComponent();

  await waitFor(() => {
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      ACCESS_TOKEN_STORAGE_KEY,
      MOCK_API_RESPONSES_JSON[API_ENDPOINT_REFRESH_TOKEN].access_token,
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      ACCESS_TOKEN_EXPIRATION_DATE_STORAGE_KEY,
      MOCK_API_RESPONSES_JSON[API_ENDPOINT_REFRESH_TOKEN]
        .access_token_expiration_utc,
    );

    expect(mockHandledFinishedFetching).toHaveBeenCalledTimes(1);
  });
});

it(`fetches a refreshed access token and calls 'hasFinishedFetching'
upon KO response`, async () => {
  (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(() => null);
  (SecureStore.getItemAsync as jest.Mock).mockImplementationOnce(
    () => "refresh_token",
  );

  fetchMock.mockOnceIf(refreshEndpoint, "{}", { status: 400 });

  renderComponent();

  await waitFor(() => {
    expect(mockHandledFinishedFetching).toHaveBeenCalledTimes(1);
  });
});

it("fetches a refreshed access token if the expiration date is before the cutoff", async () => {
  const nowTime = new Date().getTime();

  const accessTokenExpirationDate = new Date(
    nowTime + TOKEN_REFRESH_BUFFER_BEFORE_EXPIRATION_MS / 2,
  );

  (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(() =>
    accessTokenExpirationDate.toISOString(),
  );
  (SecureStore.getItemAsync as jest.Mock).mockImplementationOnce(
    () => "refresh_token",
  );

  renderComponent();

  await waitFor(() => {
    expect(fetch).toHaveBeenCalled();
  });
});

it("refreshes the access token if the expiration date is invalid", async () => {
  (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(() => "20-10-03");
  (SecureStore.getItemAsync as jest.Mock).mockImplementationOnce(
    () => "refresh_token",
  );

  renderComponent();

  await waitFor(() => {
    expect(fetch).toHaveBeenCalled();
  });
});

it("does not fetch if expiration date is absent and refresh token is absent", async () => {
  (AsyncStorage.getItem as jest.Mock).mockImplementationOnce(() => null);
  (SecureStore.getItemAsync as jest.Mock).mockImplementationOnce(() => null);

  renderComponent();

  await new Promise((resolve) => setTimeout(resolve, 1)); // Without this wait,
  // the following assertion would be inoperative, meaning it would
  // pass even if there was a bug that led the component to fetch.

  expect(fetch).not.toHaveBeenCalled();
});
