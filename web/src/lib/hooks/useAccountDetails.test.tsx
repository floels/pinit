import { render, waitFor } from "@testing-library/react";
import { useAccountDetails } from "./useAccountDetails";
import {
  API_URL_MY_ACCOUNT_DETAILS,
  PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY,
  USERNAME_LOCAL_STORAGE_KEY,
} from "@/lib/constants";
import { MockLocalStorage, withQueryClient } from "@/lib/testing-utils/misc";
import { AccountContext } from "@/contexts/accountContext";
import { AuthContext } from "@/contexts/authContext";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_SERIALIZED,
} from "@/lib/testing-utils/mockAPIResponses";

const mockLogOut = jest.fn();

jest.mock("@/lib/hooks/useLogOut", () => ({
  useLogOut: () => mockLogOut,
}));

localStorage = new MockLocalStorage();

const mockSetAccount = jest.fn();
const MOCK_ACCESS_TOKEN = "mock.access.token";

beforeEach(() => {
  fetchMock.resetMocks();
  mockLogOut.mockClear();
  mockSetAccount.mockClear();
});

let hookResult: ReturnType<typeof useAccountDetails> = { isError: false };

const TestComponent = () => {
  hookResult = useAccountDetails();
  return null;
};

const renderHookInContext = ({
  accessToken = MOCK_ACCESS_TOKEN,
  isAuthInitialized = true,
}: {
  accessToken?: string | null;
  isAuthInitialized?: boolean;
} = {}) => {
  render(
    <AuthContext.Provider
      value={{ accessToken, setAccessToken: jest.fn(), isAuthInitialized }}
    >
      <AccountContext.Provider value={{ account: null, setAccount: mockSetAccount }}>
        {withQueryClient(<TestComponent />)}
      </AccountContext.Provider>
    </AuthContext.Provider>,
  );
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

    expect(
      localStorage.getItem(PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY),
    ).toEqual(responseSerialized.profilePictureURL);
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

  renderHookInContext();

  await waitFor(() => {
    expect(hookResult.isError).toBe(true);
  });
});
