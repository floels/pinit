import React from "react";
import { renderHook, act } from "@testing-library/react";
import { useFetchWithAuth } from "./useFetchWithAuth";
import { API_URL_REFRESH_TOKEN } from "../constants";
import { AuthContext } from "@/contexts/authContext";

const mockSetAccessToken = jest.fn();
const mockLogOut = jest.fn();

jest.mock("@/lib/hooks/useLogOut", () => ({
  useLogOut: () => mockLogOut,
}));

const MOCK_ACCESS_TOKEN = "mock.access.token";
const MOCK_NEW_ACCESS_TOKEN = "mock.new.access.token";
const TARGET_URL = "http://example.com/api/resource/";

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthContext.Provider
    value={{
      accessToken: MOCK_ACCESS_TOKEN,
      setAccessToken: mockSetAccessToken,
      isAuthInitialized: true,
    }}
  >
    {children}
  </AuthContext.Provider>
);

beforeEach(() => {
  fetchMock.resetMocks();
  jest.clearAllMocks();
});

it("returns the response directly when status is not 401", async () => {
  fetchMock.mockResponseOnce("{}", { status: 200 });

  const { result } = renderHook(() => useFetchWithAuth(), { wrapper });

  let response: Response;
  await act(async () => {
    response = await result.current(TARGET_URL);
  });

  expect(response!.status).toBe(200);
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(mockLogOut).not.toHaveBeenCalled();
});

it("sets Authorization header with the current access token", async () => {
  fetchMock.mockResponseOnce("{}", { status: 200 });

  const { result } = renderHook(() => useFetchWithAuth(), { wrapper });

  await act(async () => {
    await result.current(TARGET_URL);
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

  const { result } = renderHook(() => useFetchWithAuth(), { wrapper });

  let response: Response;
  await act(async () => {
    response = await result.current(TARGET_URL);
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

  const { result } = renderHook(() => useFetchWithAuth(), { wrapper });

  await act(async () => {
    await result.current(TARGET_URL);
  });

  expect(mockLogOut).toHaveBeenCalledTimes(1);
  expect(mockSetAccessToken).not.toHaveBeenCalled();
});

it("preserves other fetch options when adding the Authorization header", async () => {
  fetchMock.mockResponseOnce("{}", { status: 200 });

  const { result } = renderHook(() => useFetchWithAuth(), { wrapper });

  await act(async () => {
    await result.current(TARGET_URL, {
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
