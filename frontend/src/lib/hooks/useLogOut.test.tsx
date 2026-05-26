import { renderHook, act } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useLogOut } from "./useLogOut";
import { API_URL_LOG_OUT } from "@/lib/constants";
import { AuthContext } from "@/contexts/authContext";
import { createTestQueryClient } from "@/lib/testing-utils/misc";

jest.mock("react-toastify", () => ({
  toast: { warn: jest.fn() },
}));

const mockSetAccessToken = jest.fn();

let testQueryClient = createTestQueryClient();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={testQueryClient}>
    <AuthContext.Provider
      value={{
        accessToken: "mock.token",
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
  mockSetAccessToken.mockReset();
  (toast.warn as jest.Mock).mockReset();
  testQueryClient = createTestQueryClient();
  delete (window as Window & { location?: Location }).location;
  (window as Window & { location: { href: string } }).location = { href: "" };
});

it("calls logout endpoint with POST and credentials include", async () => {
  fetchMock.mockResponseOnce("{}");

  const { result } = renderHook(() => useLogOut(), { wrapper });

  await act(async () => {
    await result.current();
  });

  expect(fetch).toHaveBeenCalledWith(
    API_URL_LOG_OUT,
    expect.objectContaining({ method: "POST", credentials: "include" }),
  );
});

it("clears the access token and redirects to / on success", async () => {
  fetchMock.mockResponseOnce("{}");

  const { result } = renderHook(() => useLogOut(), { wrapper });

  await act(async () => {
    await result.current();
  });

  expect(mockSetAccessToken).toHaveBeenCalledWith(null);
  expect(window.location.href).toBe("/");
});

it("shows a toast warning when the fetch throws", async () => {
  fetchMock.mockRejectOnce(new Error("network error"));

  const { result } = renderHook(() => useLogOut(), { wrapper });

  await act(async () => {
    await result.current();
  });

  expect(toast.warn).toHaveBeenCalledWith(
    "An error happened while we attempted to log you out.",
    expect.objectContaining({ toastId: "toast-log-out-error" }),
  );
  expect(mockSetAccessToken).not.toHaveBeenCalled();
});
