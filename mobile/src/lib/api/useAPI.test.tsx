import { renderHook, waitFor } from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";

import { useAPI } from "./useAPI";

import { AuthenticationContext } from "@/src/contexts/authenticationContext";
import { MissingAccessTokenError } from "@/src/lib/customErrors";
import {
  clearStoredAuthData,
  refreshAccessToken,
} from "@/src/lib/utils/authentication";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
}));

jest.mock("@/src/lib/utils/authentication", () => ({
  refreshAccessToken: jest.fn(),
  clearStoredAuthData: jest.fn(),
}));

const endpoint = "https://example.com/api/some-resource/";

const mockDispatch = jest.fn();

const renderUseAPI = () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthenticationContext.Provider
      value={{
        state: { isCheckingAccessToken: false, isAuthenticated: true },
        dispatch: mockDispatch,
      }}
    >
      {children}
    </AuthenticationContext.Provider>
  );

  return renderHook(() => useAPI(), { wrapper }).result;
};

beforeEach(() => {
  jest.resetAllMocks();
  fetchMock.resetMocks();
});

describe("fetchAuthenticated", () => {
  it("throws when there is no stored access token", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    const { current } = renderUseAPI();

    await expect(current.fetchAuthenticated(endpoint)).rejects.toBeInstanceOf(
      MissingAccessTokenError,
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("attaches the bearer token and returns the response as-is when not a 401", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("access-token");
    fetchMock.mockResponseOnce("ok", { status: 200 });

    const { current } = renderUseAPI();

    const response = await current.fetchAuthenticated(endpoint);

    expect(response.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith(
      endpoint,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer access-token",
        }),
      }),
    );
    expect(refreshAccessToken).not.toHaveBeenCalled();
  });

  it("refreshes the access token and retries the request once upon a 401", async () => {
    (SecureStore.getItemAsync as jest.Mock)
      .mockResolvedValueOnce("stale-token") // initial read
      .mockResolvedValueOnce("fresh-token"); // read after the refresh
    (refreshAccessToken as jest.Mock).mockResolvedValue(true);
    fetchMock
      .mockResponseOnce("{}", { status: 401 }) // stale token rejected
      .mockResponseOnce("ok", { status: 200 }); // retry succeeds

    const { current } = renderUseAPI();

    const response = await current.fetchAuthenticated(endpoint);

    expect(response.status).toBe(200);
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      endpoint,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer stale-token",
        }),
      }),
    );
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      endpoint,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer fresh-token",
        }),
      }),
    );
    expect(mockDispatch).not.toHaveBeenCalled();
  });

  it("ends the session when the refresh fails", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("stale-token");
    (refreshAccessToken as jest.Mock).mockResolvedValue(false);
    fetchMock.mockResponseOnce("{}", { status: 401 });

    const { current } = renderUseAPI();

    const response = await current.fetchAuthenticated(endpoint);

    expect(response.status).toBe(401);
    // No retry, and the caller needs no logout logic of its own.
    expect(fetch).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(clearStoredAuthData).toHaveBeenCalledTimes(1);
    });
    expect(mockDispatch).toHaveBeenCalledWith({ type: "GOT_401_RESPONSE" });
  });
});

describe("fetchPublic", () => {
  it("sends no authorization header", async () => {
    fetchMock.mockResponseOnce("ok", { status: 200 });

    const { current } = renderUseAPI();

    await current.fetchPublic(endpoint);

    expect(fetch).toHaveBeenCalledWith(endpoint);
    expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
  });
});
