import React from "react";
import { renderHook, act } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { useAPI } from "./useAPI";
import { API_URL_REFRESH_TOKEN } from "@/lib/constants";
import { AuthContext } from "@/contexts/authContext";
import { createTestQueryClient } from "@/lib/testing-utils/misc";

const mockSetAccessToken = vi.fn();
const { mockLogOut } = vi.hoisted(() => ({ mockLogOut: vi.fn() }));

vi.mock("@/lib/hooks/useLogOut", () => ({
  useLogOut: () => mockLogOut,
}));

const MOCK_ACCESS_TOKEN = "mock.access.token";
const MOCK_NEW_ACCESS_TOKEN = "mock.new.access.token";
const TARGET_URL = "http://example.com/api/resource/";

let testQueryClient = createTestQueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={testQueryClient}>
    <AuthContext.Provider
      value={{
        accessToken: MOCK_ACCESS_TOKEN,
        setAccessToken: mockSetAccessToken,
        isAuthInitialized: true,
      }}
    >
      {children}
    </AuthContext.Provider>
  </QueryClientProvider>
);

beforeEach(() => {
  fetchMock.resetMocks();
  vi.clearAllMocks();
  testQueryClient = createTestQueryClient();
});

it("returns the response directly when status is not 401", async () => {
  fetchMock.mockResponseOnce("{}", { status: 200 });

  const { result } = renderHook(() => useAPI(), { wrapper });

  let response: Response;
  await act(async () => {
    response = await result.current.fetchAuthenticated(TARGET_URL);
  });

  expect(response!.status).toBe(200);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(mockLogOut).not.toHaveBeenCalled();
});

it("sets Authorization header with the current access token", async () => {
  fetchMock.mockResponseOnce("{}", { status: 200 });

  const { result } = renderHook(() => useAPI(), { wrapper });

  await act(async () => {
    await result.current.fetchAuthenticated(TARGET_URL);
  });

  expect(fetch).toHaveBeenCalledWith(
    TARGET_URL,
    expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: `Bearer ${MOCK_ACCESS_TOKEN}`,
      }),
    }),
  );
});

it("retries with new token upon 401 and successful refresh", async () => {
  fetchMock
    .mockResponseOnce("{}", { status: 401 })
    .mockResponseOnce(JSON.stringify({ access_token: MOCK_NEW_ACCESS_TOKEN }), {
      status: 200,
    })
    .mockResponseOnce("{}", { status: 200 });

  const { result } = renderHook(() => useAPI(), { wrapper });

  let response: Response;
  await act(async () => {
    response = await result.current.fetchAuthenticated(TARGET_URL);
  });

  expect(response!.status).toBe(200);
  expect(fetch).toHaveBeenCalledTimes(3);
  expect(fetch).toHaveBeenNthCalledWith(
    2,
    API_URL_REFRESH_TOKEN,
    expect.objectContaining({ method: "POST" }),
  );
  expect(fetch).toHaveBeenNthCalledWith(
    3,
    TARGET_URL,
    expect.objectContaining({
      headers: expect.objectContaining({
        Authorization: `Bearer ${MOCK_NEW_ACCESS_TOKEN}`,
      }),
    }),
  );
  expect(mockSetAccessToken).toHaveBeenCalledWith(MOCK_NEW_ACCESS_TOKEN);
  expect(mockLogOut).not.toHaveBeenCalled();
});

it("calls logout upon 401 and failed refresh", async () => {
  fetchMock
    .mockResponseOnce("{}", { status: 401 })
    .mockResponseOnce("{}", { status: 401 });

  const { result } = renderHook(() => useAPI(), { wrapper });

  await act(async () => {
    await result.current.fetchAuthenticated(TARGET_URL);
  });

  expect(mockLogOut).toHaveBeenCalledTimes(1);
  expect(mockSetAccessToken).not.toHaveBeenCalled();
});

it("preserves other fetch options when adding the Authorization header", async () => {
  fetchMock.mockResponseOnce("{}", { status: 200 });

  const { result } = renderHook(() => useAPI(), { wrapper });

  await act(async () => {
    await result.current.fetchAuthenticated(TARGET_URL, {
      method: "POST",
      body: "some-body",
    });
  });

  expect(fetch).toHaveBeenCalledWith(
    TARGET_URL,
    expect.objectContaining({
      method: "POST",
      body: "some-body",
      headers: expect.objectContaining({
        Authorization: `Bearer ${MOCK_ACCESS_TOKEN}`,
      }),
    }),
  );
});

it("shares a single refresh across concurrent 401s (single-flight)", async () => {
  // All initial requests (old token) 401; the refresh succeeds; retries (new
  // token) succeed. Routed by URL + Authorization header so concurrent,
  // interleaved requests are handled deterministically.
  fetchMock.mockResponse(async (req) => {
    if (req.url === API_URL_REFRESH_TOKEN) {
      return JSON.stringify({ access_token: MOCK_NEW_ACCESS_TOKEN });
    }
    const authorization = req.headers.get("Authorization");
    if (authorization === `Bearer ${MOCK_ACCESS_TOKEN}`) {
      return { body: "{}", status: 401 };
    }
    return { body: "{}", status: 200 };
  });

  const { result } = renderHook(() => useAPI(), { wrapper });

  let responses: Response[] = [];
  await act(async () => {
    responses = await Promise.all([
      result.current.fetchAuthenticated(TARGET_URL),
      result.current.fetchAuthenticated(TARGET_URL),
      result.current.fetchAuthenticated(TARGET_URL),
    ]);
  });

  // Every concurrent request eventually succeeds after the shared refresh...
  expect(responses.map((response) => response.status)).toEqual([200, 200, 200]);
  // ...but the refresh endpoint is hit only ONCE, not once per request — so the
  // rotating refresh token can't race and revoke itself.
  const refreshCalls = fetchMock.mock.calls.filter(
    ([url]) => url === API_URL_REFRESH_TOKEN,
  );
  expect(refreshCalls).toHaveLength(1);
});

it("sends no Authorization header on a public call", async () => {
  fetchMock.mockResponseOnce("{}", { status: 200 });

  const { result } = renderHook(() => useAPI(), { wrapper });

  await act(async () => {
    await result.current.fetchPublic(TARGET_URL);
  });

  const [, options] = fetchMock.mock.calls[0];
  expect(options?.headers).toBeUndefined();
});

it("omits credentials on an external call", async () => {
  fetchMock.mockResponseOnce("{}", { status: 200 });

  const { result } = renderHook(() => useAPI(), { wrapper });

  await act(async () => {
    await result.current.fetchExternal(TARGET_URL, { method: "PUT" });
  });

  expect(fetch).toHaveBeenCalledWith(
    TARGET_URL,
    expect.objectContaining({ method: "PUT", credentials: "omit" }),
  );
});

it("sends the refresh with credentials, so the browser attaches the cookie", async () => {
  fetchMock
    .mockResponseOnce("{}", { status: 401 })
    .mockResponseOnce(JSON.stringify({ access_token: MOCK_NEW_ACCESS_TOKEN }), {
      status: 200,
    })
    .mockResponseOnce("{}", { status: 200 });

  const { result } = renderHook(() => useAPI(), { wrapper });

  await act(async () => {
    await result.current.fetchAuthenticated(TARGET_URL);
  });

  expect(fetch).toHaveBeenNthCalledWith(
    2,
    API_URL_REFRESH_TOKEN,
    expect.objectContaining({ method: "POST", credentials: "include" }),
  );
});
