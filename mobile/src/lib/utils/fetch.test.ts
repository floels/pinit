import * as SecureStore from "expo-secure-store";

import { MissingAccessTokenError } from "@/src/lib/customErrors";
import { refreshAccessToken } from "@/src/lib/utils/authentication";
import { fetchWithAuthentication } from "@/src/lib/utils/fetch";

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
}));

jest.mock("@/src/lib/utils/authentication", () => ({
  refreshAccessToken: jest.fn(),
}));

const endpoint = "https://example.com/api/some-resource/";

beforeEach(() => {
  jest.resetAllMocks();
  fetchMock.resetMocks();
});

it("throws when there is no stored access token", async () => {
  (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

  await expect(fetchWithAuthentication(endpoint)).rejects.toBeInstanceOf(
    MissingAccessTokenError,
  );
  expect(fetch).not.toHaveBeenCalled();
});

it("attaches the bearer token and returns the response as-is when not a 401", async () => {
  (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("access-token");
  fetchMock.mockResponseOnce("ok", { status: 200 });

  const response = await fetchWithAuthentication(endpoint);

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

  const response = await fetchWithAuthentication(endpoint);

  expect(response.status).toBe(200);
  expect(refreshAccessToken).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledTimes(2);
  expect(fetch).toHaveBeenNthCalledWith(
    1,
    endpoint,
    expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer stale-token" }),
    }),
  );
  expect(fetch).toHaveBeenNthCalledWith(
    2,
    endpoint,
    expect.objectContaining({
      headers: expect.objectContaining({ Authorization: "Bearer fresh-token" }),
    }),
  );
});

it("returns the 401 without retrying when the refresh fails", async () => {
  (SecureStore.getItemAsync as jest.Mock).mockResolvedValue("stale-token");
  (refreshAccessToken as jest.Mock).mockResolvedValue(false);
  fetchMock.mockResponseOnce("{}", { status: 401 });

  const response = await fetchWithAuthentication(endpoint);

  expect(response.status).toBe(401);
  expect(refreshAccessToken).toHaveBeenCalledTimes(1);
  // No retry: the caller receives the 401 and logs the user out.
  expect(fetch).toHaveBeenCalledTimes(1);
});
