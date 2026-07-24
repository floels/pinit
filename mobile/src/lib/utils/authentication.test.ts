import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";

import {
  ACCESS_TOKEN_EXPIRATION_DATE_STORAGE_KEY,
  ACCESS_TOKEN_STORAGE_KEY,
  API_BASE_URL,
  API_ENDPOINT_LOGOUT,
  API_ENDPOINT_REFRESH_TOKEN,
  PROFILE_PICTURE_URL_STORAGE_KEY,
  REFRESH_TOKEN_STORAGE_KEY,
} from "@/src/lib/constants";
import {
  TOKEN_REFRESH_BUFFER_BEFORE_EXPIRATION_MS,
  clearStoredAuthData,
  ensureFreshAccessToken,
  logOut,
  refreshAccessToken,
} from "@/src/lib/utils/authentication";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

const refreshEndpoint = `${API_BASE_URL}/${API_ENDPOINT_REFRESH_TOKEN}`;

beforeEach(() => {
  jest.resetAllMocks();
  fetchMock.resetMocks();
});

describe("ensureFreshAccessToken", () => {
  it("returns true without refreshing when the token is not near expiry", async () => {
    const farFutureDate = new Date(
      Date.now() + 10 * TOKEN_REFRESH_BUFFER_BEFORE_EXPIRATION_MS,
    ).toISOString();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(farFutureDate);

    const result = await ensureFreshAccessToken();

    expect(result).toBe(true);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("refreshes and persists the token when near expiry, then returns true", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null); // -> should refresh
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("refresh-token");
    fetchMock.mockResponseOnce(
      JSON.stringify({
        access_token: "new-access-token",
        access_token_expiration_utc: "2999-01-01T00:00:00Z",
      }),
    );

    const result = await ensureFreshAccessToken();

    expect(result).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      refreshEndpoint,
      expect.objectContaining({ method: "POST" }),
    );
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      ACCESS_TOKEN_STORAGE_KEY,
      "new-access-token",
    );
  });

  it("returns false when there is no refresh token to refresh with", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    const result = await ensureFreshAccessToken();

    expect(result).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns false when the refresh request fails", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("refresh-token");
    fetchMock.mockResponseOnce("{}", { status: 401 });

    const result = await ensureFreshAccessToken();

    expect(result).toBe(false);
  });
});

describe("refreshAccessToken", () => {
  it("refreshes and persists the token regardless of the local expiry, then returns true", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("refresh-token");
    fetchMock.mockResponseOnce(
      JSON.stringify({
        access_token: "new-access-token",
        access_token_expiration_utc: "2999-01-01T00:00:00Z",
      }),
    );

    const result = await refreshAccessToken();

    expect(result).toBe(true);
    // It does not consult the local expiration date — it always attempts a
    // refresh (used when the server has already rejected the access token):
    expect(AsyncStorage.getItem).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith(
      refreshEndpoint,
      expect.objectContaining({ method: "POST" }),
    );
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      ACCESS_TOKEN_STORAGE_KEY,
      "new-access-token",
    );
  });

  it("persists the rotated refresh token returned by the server", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(
      "old-refresh-token",
    );
    fetchMock.mockResponseOnce(
      JSON.stringify({
        access_token: "new-access-token",
        refresh_token: "rotated-refresh-token",
        access_token_expiration_utc: "2999-01-01T00:00:00Z",
      }),
    );

    await refreshAccessToken();

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      REFRESH_TOKEN_STORAGE_KEY,
      "rotated-refresh-token",
    );
  });

  it("returns false when there is no refresh token to refresh with", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    const result = await refreshAccessToken();

    expect(result).toBe(false);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("returns false when the refresh request fails", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("refresh-token");
    fetchMock.mockResponseOnce("{}", { status: 401 });

    const result = await refreshAccessToken();

    expect(result).toBe(false);
  });
});

describe("clearStoredAuthData", () => {
  it("removes every piece of persisted auth/session data", async () => {
    await clearStoredAuthData();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      ACCESS_TOKEN_STORAGE_KEY,
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      REFRESH_TOKEN_STORAGE_KEY,
    );
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
      ACCESS_TOKEN_EXPIRATION_DATE_STORAGE_KEY,
    );
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
      PROFILE_PICTURE_URL_STORAGE_KEY,
    );
  });
});

const logoutEndpoint = `${API_BASE_URL}/${API_ENDPOINT_LOGOUT}`;

describe("logOut", () => {
  it("posts the refresh token to the logout endpoint, then clears stored data", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("refresh-token");
    fetchMock.mockResponseOnce("{}");

    await logOut();

    expect(fetch).toHaveBeenCalledWith(
      logoutEndpoint,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ refresh_token: "refresh-token" }),
      }),
    );
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      REFRESH_TOKEN_STORAGE_KEY,
    );
  });

  it("clears stored data even when the logout request fails", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("refresh-token");
    fetchMock.mockRejectOnce(new Error("network error"));

    await logOut();

    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      ACCESS_TOKEN_STORAGE_KEY,
    );
  });

  it("skips the request and still clears data when there is no refresh token", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    await logOut();

    expect(fetch).not.toHaveBeenCalled();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(
      ACCESS_TOKEN_STORAGE_KEY,
    );
  });
});

describe("refreshAccessToken single-flight", () => {
  it("dedupes concurrent refreshes into a single request", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("refresh-token");
    fetchMock.mockResponse(
      JSON.stringify({
        access_token: "new-access-token",
        refresh_token: "rotated-refresh-token",
        access_token_expiration_utc: "2999-01-01T00:00:00Z",
      }),
    );

    const results = await Promise.all([
      refreshAccessToken(),
      refreshAccessToken(),
      refreshAccessToken(),
    ]);

    // All callers see the same successful outcome...
    expect(results).toEqual([true, true, true]);
    // ...but the refresh endpoint is hit only once, so the rotating refresh
    // token can't race and revoke itself.
    const refreshCalls = fetchMock.mock.calls.filter(
      ([url]) => url === refreshEndpoint,
    );
    expect(refreshCalls).toHaveLength(1);
  });
});
