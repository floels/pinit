import { renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { useAccountDetails } from "./useAccountDetails";
import {
  API_URL_MY_ACCOUNT_DETAILS,
  PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY,
  USERNAME_LOCAL_STORAGE_KEY,
} from "@/lib/constants";
import {
  MockLocalStorage,
  createTestQueryClient,
} from "@/lib/testing-utils/misc";
import { AccountContext } from "@/contexts/accountContext";
import { AuthContext } from "@/contexts/authContext";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_SERIALIZED,
} from "@/lib/testing-utils/mockAPIResponses";

const { mockLogOut } = vi.hoisted(() => ({ mockLogOut: vi.fn() }));

vi.mock("@/lib/hooks/useLogOut", () => ({
  useLogOut: () => mockLogOut,
}));

localStorage = new MockLocalStorage();

const mockSetAccount = vi.fn();
const MOCK_ACCESS_TOKEN = "mock.access.token";

beforeEach(() => {
  fetchMock.resetMocks();
  mockLogOut.mockClear();
  mockSetAccount.mockClear();
});

const renderHookInContext = ({
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
      value={{ accessToken, setAccessToken: vi.fn(), isAuthInitialized }}
    >
      <AccountContext.Provider
        value={{ account: null, setAccount: mockSetAccount }}
      >
        <QueryClientProvider client={testQueryClient}>
          {children}
        </QueryClientProvider>
      </AccountContext.Provider>
    </AuthContext.Provider>
  );

  return renderHook(() => useAccountDetails(), { wrapper });
};

it(`calls 'setAccount' with proper arguments and persists
relevant data upon successful fetch`, async () => {
  fetchMock.mockOnceIf(
    API_URL_MY_ACCOUNT_DETAILS,
    MOCK_API_RESPONSES[API_URL_MY_ACCOUNT_DETAILS],
  );

  renderHookInContext();

  const responseSerialized =
    MOCK_API_RESPONSES_SERIALIZED[API_URL_MY_ACCOUNT_DETAILS];

  await waitFor(() => {
    expect(mockSetAccount).toHaveBeenCalledWith(responseSerialized);

    expect(localStorage.getItem(USERNAME_LOCAL_STORAGE_KEY)).toEqual(
      responseSerialized.username,
    );

    expect(localStorage.getItem(PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY)).toEqual(
      responseSerialized.profilePictureURL,
    );
  });
});

it("sends the access token as Authorization header", async () => {
  fetchMock.mockOnceIf(
    API_URL_MY_ACCOUNT_DETAILS,
    MOCK_API_RESPONSES[API_URL_MY_ACCOUNT_DETAILS],
  );

  renderHookInContext();

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

it("triggers logout upon 401 response when refresh also fails", async () => {
  fetchMock
    .mockResponseOnce("{}", { status: 401 }) // fetch account details → 401
    .mockResponseOnce("{}", { status: 401 }); // refresh attempt → 401

  renderHookInContext();

  await waitFor(() => {
    expect(mockLogOut).toHaveBeenCalledTimes(1);
  });
});

it("retries and sets account upon 401 response when refresh succeeds", async () => {
  fetchMock
    .mockResponseOnce("{}", { status: 401 }) // fetch account details → 401
    .mockResponseOnce(JSON.stringify({ access_token: "new.access.token" }), {
      status: 200,
    }) // refresh → new token
    .mockResponseOnce(MOCK_API_RESPONSES[API_URL_MY_ACCOUNT_DETAILS]); // retry → success

  renderHookInContext();

  await waitFor(() => {
    expect(mockSetAccount).toHaveBeenCalledWith(
      MOCK_API_RESPONSES_SERIALIZED[API_URL_MY_ACCOUNT_DETAILS],
    );
  });
  expect(mockLogOut).not.toHaveBeenCalled();
});

it("does not fetch account details when not authenticated", async () => {
  renderHookInContext({ accessToken: null });

  // Give React Query a chance to fire if it were going to
  await new Promise((resolve) => setTimeout(resolve, 50));

  expect(fetch).not.toHaveBeenCalled();
});

it("returns isError: true when fetch fails", async () => {
  fetchMock.mockResponseOnce("{}", { status: 500 });

  const { result } = renderHookInContext();

  await waitFor(() => {
    expect(result.current.isError).toBe(true);
  });
});
