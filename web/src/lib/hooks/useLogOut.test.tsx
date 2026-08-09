import { renderHook, act } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { useLogOut } from "./useLogOut";
import { API_URL_LOG_OUT } from "@/lib/constants";
import { AuthContext } from "@/contexts/authContext";
import { REFRESH_ACCESS_TOKEN_QUERY_KEY } from "@/lib/api/refreshAccessToken";
import { createTestQueryClient } from "@/lib/testing-utils/misc";

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));

vi.mock("react-router", async (importOriginal) => ({
  ...(await importOriginal<typeof import("react-router")>()),
  useNavigate: () => mockNavigate,
}));

const mockClearSession = vi.fn();

let testQueryClient = createTestQueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={testQueryClient}>
    <AuthContext.Provider
      value={{
        accessToken: "mock.token",
        setAccessToken: vi.fn(),
        isAuthInitialized: true,
        sessionExpired: false,
        clearSession: mockClearSession,
        endSession: vi.fn(),
        clearSessionExpiry: vi.fn(),
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

it("calls logout endpoint with DELETE and credentials include", async () => {
  fetchMock.mockResponseOnce("{}");

  const { result } = renderHook(() => useLogOut(), { wrapper });

  await act(async () => {
    await result.current();
  });

  expect(fetch).toHaveBeenCalledWith(
    API_URL_LOG_OUT,
    expect.objectContaining({ method: "DELETE", credentials: "include" }),
  );
});

it("clears the session and navigates to / on success", async () => {
  fetchMock.mockResponseOnce("{}");

  const { result } = renderHook(() => useLogOut(), { wrapper });

  await act(async () => {
    await result.current();
  });

  expect(mockClearSession).toHaveBeenCalledTimes(1);
  expect(mockNavigate).toHaveBeenCalledWith("/");
});

it("still clears the session and navigates to / when the fetch throws", async () => {
  fetchMock.mockRejectOnce(new Error("network error"));

  const { result } = renderHook(() => useLogOut(), { wrapper });

  await act(async () => {
    await result.current();
  });

  // Logout is best-effort: even if the server call fails, the user must be
  // logged out locally rather than left stuck.
  expect(mockClearSession).toHaveBeenCalledTimes(1);
  expect(mockNavigate).toHaveBeenCalledWith("/");
});

it("navigates with the router, so the document is not reloaded", async () => {
  fetchMock.mockResponseOnce("{}");

  const { result } = renderHook(() => useLogOut(), { wrapper });

  await act(async () => {
    await result.current();
  });

  expect(window.location.href).not.toBe("/");
});

it(`drops the cached queries of the account that logged out,
but keeps the startup refresh entry`, async () => {
  fetchMock.mockResponseOnce("{}");

  // Not keyed by the access token, so a stale entry would surface under the
  // next account.
  testQueryClient.setQueryData(["pin-suggestions"], ["a pin"]);
  // Active in AuthContextProvider: removing it would restart the refresh and
  // flash a spinner over the route.
  testQueryClient.setQueryData(REFRESH_ACCESS_TOKEN_QUERY_KEY, {
    access_token: "mock.token",
  });

  const { result } = renderHook(() => useLogOut(), { wrapper });

  await act(async () => {
    await result.current();
  });

  expect(testQueryClient.getQueryData(["pin-suggestions"])).toBeUndefined();
  expect(testQueryClient.getQueryData(REFRESH_ACCESS_TOKEN_QUERY_KEY)).toEqual({
    access_token: "mock.token",
  });
});
