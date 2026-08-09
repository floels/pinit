import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { AccountContextProvider, useAccountContext } from "./accountContext";
import {
  API_URL_MY_ACCOUNT_DETAILS,
  PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY,
  USERNAME_LOCAL_STORAGE_KEY,
} from "@/lib/constants";
import {
  MockLocalStorage,
  createTestQueryClient,
} from "@/lib/testing-utils/misc";
import { AuthContext } from "@/contexts/authContext";
import { AccountWithPrivateDetails } from "@/lib/types/frontendTypes";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_SERIALIZED,
} from "@/lib/testing-utils/mockAPIResponses";

const mockEndSession = vi.fn();

localStorage = new MockLocalStorage();

const MOCK_ACCESS_TOKEN = "mock.access.token";

const ACCOUNT_SERIALIZED = MOCK_API_RESPONSES_SERIALIZED[
  API_URL_MY_ACCOUNT_DETAILS
] as AccountWithPrivateDetails;

beforeEach(() => {
  fetchMock.resetMocks();
  mockEndSession.mockClear();
  localStorage.clear();
});

const renderAccountContext = ({
  accessToken = MOCK_ACCESS_TOKEN,
  isAuthInitialized = true,
}: {
  accessToken?: string | null;
  isAuthInitialized?: boolean;
} = {}) => {
  // One client per render, created outside the wrapper so that re-renders keep
  // the same React Query cache.
  const testQueryClient = createTestQueryClient();

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider
      value={{
        accessToken,
        setAccessToken: vi.fn(),
        isAuthInitialized,
        isPromptingLogin: false,
        clearSession: vi.fn(),
        endSession: mockEndSession,
        stopPromptingLogin: vi.fn(),
      }}
    >
      <QueryClientProvider client={testQueryClient}>
        <AccountContextProvider>{children}</AccountContextProvider>
      </QueryClientProvider>
    </AuthContext.Provider>
  );

  return renderHook(() => useAccountContext(), { wrapper });
};

it(`exposes the account and persists relevant data
upon successful fetch`, async () => {
  fetchMock.mockOnceIf(
    API_URL_MY_ACCOUNT_DETAILS,
    MOCK_API_RESPONSES[API_URL_MY_ACCOUNT_DETAILS],
  );

  const { result } = renderAccountContext();

  await waitFor(() => {
    expect(result.current.account).toEqual(ACCOUNT_SERIALIZED);

    expect(localStorage.getItem(USERNAME_LOCAL_STORAGE_KEY)).toEqual(
      ACCOUNT_SERIALIZED.username,
    );

    expect(localStorage.getItem(PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY)).toEqual(
      ACCOUNT_SERIALIZED.profilePictureURL,
    );
  });
});

it("sends the access token as Authorization header", async () => {
  fetchMock.mockOnceIf(
    API_URL_MY_ACCOUNT_DETAILS,
    MOCK_API_RESPONSES[API_URL_MY_ACCOUNT_DETAILS],
  );

  renderAccountContext();

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      API_URL_MY_ACCOUNT_DETAILS,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: `Bearer ${MOCK_ACCESS_TOKEN}`,
        }),
      }),
    );
  });
});

it("expires the session upon 401 response when refresh also fails", async () => {
  fetchMock
    .mockResponseOnce("{}", { status: 401 }) // fetch account details → 401
    .mockResponseOnce("{}", { status: 401 }); // refresh attempt → 401

  renderAccountContext();

  await waitFor(() => {
    expect(mockEndSession).toHaveBeenCalledTimes(1);
  });
});

it("retries and exposes the account upon 401 response when refresh succeeds", async () => {
  fetchMock
    .mockResponseOnce("{}", { status: 401 }) // fetch account details → 401
    .mockResponseOnce(JSON.stringify({ access_token: "new.access.token" }), {
      status: 200,
    }) // refresh → new token
    .mockResponseOnce(MOCK_API_RESPONSES[API_URL_MY_ACCOUNT_DETAILS]); // retry → success

  const { result } = renderAccountContext();

  await waitFor(() => {
    expect(result.current.account).toEqual(ACCOUNT_SERIALIZED);
  });
  expect(mockEndSession).not.toHaveBeenCalled();
});

it("does not fetch account details when not authenticated", async () => {
  renderAccountContext({ accessToken: null });

  // Give React Query a chance to fire if it were going to
  await new Promise((resolve) => setTimeout(resolve, 50));

  expect(fetch).not.toHaveBeenCalled();
});

it("exposes isFetchError: true when the fetch fails", async () => {
  fetchMock.mockResponseOnce("{}", { status: 500 });

  const { result } = renderAccountContext();

  await waitFor(() => {
    expect(result.current.isFetchError).toBe(true);
  });
});

it(`refetches the account when the access token changes,
and reads null in between`, async () => {
  fetchMock.mockResponse(MOCK_API_RESPONSES[API_URL_MY_ACCOUNT_DETAILS]);

  const testQueryClient = createTestQueryClient();

  let accessToken = "token.one";

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthContext.Provider
      value={{ accessToken, setAccessToken: vi.fn(), isAuthInitialized: true }}
    >
      <QueryClientProvider client={testQueryClient}>
        <AccountContextProvider>{children}</AccountContextProvider>
      </QueryClientProvider>
    </AuthContext.Provider>
  );

  const { result, rerender } = renderHook(() => useAccountContext(), {
    wrapper,
  });

  await waitFor(() => {
    expect(result.current.account).toEqual(ACCOUNT_SERIALIZED);
  });
  expect(fetchMock).toHaveBeenCalledTimes(1);

  accessToken = "token.two";
  rerender();

  // The query key carries the access token, so a new token is a new cache
  // entry. `doc/authentication.md` §1 records this behavior. If the blank
  // window disappears, update that section too.
  expect(result.current.account).toBeNull();

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.account).toEqual(ACCOUNT_SERIALIZED);
  });
});

it("exposes the account passed to 'setAccount'", async () => {
  fetchMock.mockOnceIf(
    API_URL_MY_ACCOUNT_DETAILS,
    MOCK_API_RESPONSES[API_URL_MY_ACCOUNT_DETAILS],
  );

  const { result } = renderAccountContext();

  await waitFor(() => {
    expect(result.current.account).toEqual(ACCOUNT_SERIALIZED);
  });

  const newBoard = {
    id: "000000000000000003",
    name: "New board",
    slug: "new-board",
    firstImageURLs: [],
  };

  const updatedAccount = {
    ...ACCOUNT_SERIALIZED,
    boards: [...ACCOUNT_SERIALIZED.boards, newBoard],
  };

  act(() => {
    result.current.setAccount(updatedAccount);
  });

  // React Query notifies its observers asynchronously, so the new value
  // reaches the consumer on a later tick.
  await waitFor(() => {
    expect(result.current.account).toEqual(updatedAccount);
  });
});
