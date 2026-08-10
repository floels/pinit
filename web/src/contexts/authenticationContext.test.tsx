import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AuthenticationContextProvider,
  useAuthenticationContext,
} from "./authenticationContext";
import {
  API_URL_REFRESH_TOKEN,
  PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY,
  USERNAME_LOCAL_STORAGE_KEY,
} from "@/lib/constants";
import { MOCK_API_RESPONSES } from "@/lib/testing-utils/mockAPIResponses";

const TestConsumer = () => {
  const {
    accessToken,
    isAuthInitialized,
    isPromptingLogin,
    setAccessToken,
    clearSession,
    endSession,
    stopPromptingLogin,
  } = useAuthenticationContext();

  return (
    <>
      <div data-testid="access-token">{accessToken ?? "null"}</div>
      <div data-testid="is-auth-initialized">{String(isAuthInitialized)}</div>
      <div data-testid="is-prompting-login">{String(isPromptingLogin)}</div>
      <button onClick={clearSession} data-testid="clear-session" />
      <button onClick={endSession} data-testid="end-session" />
      <button onClick={stopPromptingLogin} data-testid="dismiss" />
      <button
        onClick={() => setAccessToken("new.access.token")}
        data-testid="log-in"
      />
    </>
  );
};

const renderProvider = () => {
  render(
    <AuthenticationContextProvider>
      <TestConsumer />
    </AuthenticationContextProvider>,
  );
};

// Every test waits for this before it asserts. The startup refresh is
// single-flight at module level, so a test that ends while its refresh is still
// open would hand that same request to the next one.
const waitForAuthInitialized = () =>
  waitFor(() => {
    expect(screen.getByTestId("is-auth-initialized")).toHaveTextContent("true");
  });

const seedPersistedAccountData = () => {
  localStorage.setItem(USERNAME_LOCAL_STORAGE_KEY, "johndoe");
  localStorage.setItem(
    PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY,
    "https://some.domain.com/profile-picture.jpg",
  );
};

const expectPersistedAccountDataCleared = () => {
  expect(localStorage.getItem(USERNAME_LOCAL_STORAGE_KEY)).toBeNull();
  expect(
    localStorage.getItem(PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY),
  ).toBeNull();
};

beforeEach(() => {
  fetchMock.resetMocks();
  localStorage.clear();
});

it("calls the refresh endpoint on mount", async () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_URL_REFRESH_TOKEN]);

  renderProvider();

  expect(fetch).toHaveBeenCalledWith(
    API_URL_REFRESH_TOKEN,
    expect.objectContaining({ method: "POST", credentials: "include" }),
  );

  await waitForAuthInitialized();
});

it("sets the access token and marks auth initialized on a successful refresh", async () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_URL_REFRESH_TOKEN]);

  renderProvider();

  await waitForAuthInitialized();

  expect(screen.getByTestId("access-token")).toHaveTextContent(
    "mock.access.token.refresh",
  );
});

it("marks auth initialized without setting a token on a failed refresh", async () => {
  fetchMock.mockResponseOnce("{}", { status: 401 });

  renderProvider();

  await waitForAuthInitialized();

  expect(screen.getByTestId("access-token")).toHaveTextContent("null");
});

it("marks auth initialized when the refresh request throws", async () => {
  fetchMock.mockRejectOnce(new Error("network error"));

  renderProvider();

  await waitForAuthInitialized();

  expect(screen.getByTestId("access-token")).toHaveTextContent("null");
});

it("keeps a token that a login supplied while the startup refresh was open", async () => {
  let resolveRefresh: (body: string) => void;

  const refreshBody = new Promise<string>((resolve) => {
    resolveRefresh = resolve;
  });

  fetchMock.mockResponseOnce(() => refreshBody);

  renderProvider();

  // The startup refresh has not answered yet, and the user logs in.
  await userEvent.click(screen.getByTestId("log-in"));

  expect(screen.getByTestId("access-token")).toHaveTextContent(
    "new.access.token",
  );

  resolveRefresh!(MOCK_API_RESPONSES[API_URL_REFRESH_TOKEN]);

  await waitForAuthInitialized();

  // The login wins. A startup refresh that lands late must not replace the
  // token of the session that the user just opened.
  expect(screen.getByTestId("access-token")).toHaveTextContent(
    "new.access.token",
  );
});

it("clears the token and the account data, and asks for nothing", async () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_URL_REFRESH_TOKEN]);
  seedPersistedAccountData();

  renderProvider();

  await waitForAuthInitialized();

  await userEvent.click(screen.getByTestId("clear-session"));

  expect(screen.getByTestId("access-token")).toHaveTextContent("null");
  expect(screen.getByTestId("is-prompting-login")).toHaveTextContent("false");
  expectPersistedAccountDataCleared();
});

it("asks for a new login on endSession", async () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_URL_REFRESH_TOKEN]);
  seedPersistedAccountData();

  renderProvider();

  await waitForAuthInitialized();

  await userEvent.click(screen.getByTestId("end-session"));

  expect(screen.getByTestId("access-token")).toHaveTextContent("null");
  expect(screen.getByTestId("is-prompting-login")).toHaveTextContent("true");
  expectPersistedAccountDataCleared();
});

it("stops asking once a login supplies a token", async () => {
  fetchMock.mockResponseOnce("{}", { status: 401 });

  renderProvider();

  await waitForAuthInitialized();

  await userEvent.click(screen.getByTestId("end-session"));

  expect(screen.getByTestId("is-prompting-login")).toHaveTextContent("true");

  await userEvent.click(screen.getByTestId("log-in"));

  expect(screen.getByTestId("access-token")).toHaveTextContent(
    "new.access.token",
  );
  expect(screen.getByTestId("is-prompting-login")).toHaveTextContent("false");
});

it("stops asking on stopPromptingLogin", async () => {
  fetchMock.mockResponseOnce("{}", { status: 401 });

  renderProvider();

  await waitForAuthInitialized();

  await userEvent.click(screen.getByTestId("end-session"));
  await userEvent.click(screen.getByTestId("dismiss"));

  expect(screen.getByTestId("is-prompting-login")).toHaveTextContent("false");
  expect(screen.getByTestId("access-token")).toHaveTextContent("null");
});
