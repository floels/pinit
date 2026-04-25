import { renderHook, act } from "@testing-library/react";
import { useLogIn } from "./useLogIn";
import { API_URL_REFRESH_TOKEN } from "@/lib/constants";
import { AuthContext } from "@/contexts/authContext";

const mockSetAccessToken = jest.fn();

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthContext.Provider
    value={{
      accessToken: null,
      setAccessToken: mockSetAccessToken,
      isAuthInitialized: false,
      setIsAuthInitialized: jest.fn(),
    }}
  >
    {children}
  </AuthContext.Provider>
);

beforeEach(() => {
  fetchMock.resetMocks();
  mockSetAccessToken.mockReset();
});

it("calls the refresh endpoint with POST and credentials include", async () => {
  fetchMock.mockResponseOnce(
    JSON.stringify({ access_token: "new.access.token" }),
  );

  const { result } = renderHook(() => useLogIn(), { wrapper });

  await act(async () => {
    await result.current();
  });

  expect(fetch).toHaveBeenCalledWith(
    API_URL_REFRESH_TOKEN,
    expect.objectContaining({ method: "POST", credentials: "include" }),
  );
});

it("stores the access token in context on success", async () => {
  fetchMock.mockResponseOnce(
    JSON.stringify({ access_token: "new.access.token" }),
  );

  const { result } = renderHook(() => useLogIn(), { wrapper });

  await act(async () => {
    await result.current();
  });

  expect(mockSetAccessToken).toHaveBeenCalledWith("new.access.token");
});

it("does not set access token on KO response", async () => {
  fetchMock.mockResponseOnce("{}", { status: 401 });

  const { result } = renderHook(() => useLogIn(), { wrapper });

  await act(async () => {
    await result.current();
  });

  expect(mockSetAccessToken).not.toHaveBeenCalled();
});
