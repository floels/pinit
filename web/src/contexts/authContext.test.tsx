import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AuthContextProvider, useAuthContext } from "./authContext";
import {
  API_URL_REFRESH_TOKEN,
  PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY,
  USERNAME_LOCAL_STORAGE_KEY,
} from "@/lib/constants";
import { MOCK_API_RESPONSES } from "@/lib/testing-utils/mockAPIResponses";
import { withQueryClient } from "@/lib/testing-utils/misc";

const TestConsumer = () => {
  const { accessToken, isAuthInitialized } = useAuthContext();
  return (
    <>
      <div data-testid="access-token">{accessToken ?? "null"}</div>
      <div data-testid="is-auth-initialized">{String(isAuthInitialized)}</div>
    </>
  );
};

beforeEach(() => {
  fetchMock.resetMocks();
  localStorage.clear();
});

const renderProvider = () => {
  render(
    withQueryClient(
      <AuthContextProvider>
        <TestConsumer />
      </AuthContextProvider>,
    ),
  );
};

it("calls refresh endpoint on page load", () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_URL_REFRESH_TOKEN]);

  renderProvider();

  expect(fetch).toHaveBeenCalledWith(
    API_URL_REFRESH_TOKEN,
    expect.objectContaining({ method: "POST", credentials: "include" }),
  );
});

it("sets access token and marks auth initialized on successful refresh", async () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_URL_REFRESH_TOKEN]);

  renderProvider();

  await waitFor(() => {
    expect(screen.getByTestId("access-token")).toHaveTextContent(
      "mock.access.token.refresh",
    );
    expect(screen.getByTestId("is-auth-initialized")).toHaveTextContent("true");
  });
});

it("marks auth initialized without setting token on failed refresh", async () => {
  fetchMock.mockResponseOnce("{}", { status: 401 });

  renderProvider();

  await waitFor(() => {
    expect(screen.getByTestId("is-auth-initialized")).toHaveTextContent("true");
  });

  expect(screen.getByTestId("access-token")).toHaveTextContent("null");
});

const SessionConsumer = () => {
  const {
    accessToken,
    isPromptingLogin,
    setAccessToken,
    clearSession,
    endSession,
    stopPromptingLogin,
  } = useAuthContext();

  return (
    <>
      <div data-testid="access-token">{accessToken ?? "null"}</div>
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

const renderSessionConsumer = () => {
  render(
    withQueryClient(
      <AuthContextProvider>
        <SessionConsumer />
      </AuthContextProvider>,
    ),
  );
};

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

it("clears the token and the account data, and asks for nothing", async () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_URL_REFRESH_TOKEN]);
  seedPersistedAccountData();

  renderSessionConsumer();

  await waitFor(() => {
    expect(screen.getByTestId("access-token")).toHaveTextContent(
      "mock.access.token.refresh",
    );
  });

  await userEvent.click(screen.getByTestId("clear-session"));

  // Explicit null beats the cached refresh result, which still holds a token.
  expect(screen.getByTestId("access-token")).toHaveTextContent("null");
  expect(screen.getByTestId("is-prompting-login")).toHaveTextContent("false");
  expectPersistedAccountDataCleared();
});

it("asks for a new login on endSession", async () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_URL_REFRESH_TOKEN]);
  seedPersistedAccountData();

  renderSessionConsumer();

  await userEvent.click(screen.getByTestId("end-session"));

  expect(screen.getByTestId("access-token")).toHaveTextContent("null");
  expect(screen.getByTestId("is-prompting-login")).toHaveTextContent("true");
  expectPersistedAccountDataCleared();
});

it("stops asking once a login supplies a token", async () => {
  fetchMock.mockResponseOnce("{}", { status: 401 });

  renderSessionConsumer();

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

  renderSessionConsumer();

  await userEvent.click(screen.getByTestId("end-session"));
  await userEvent.click(screen.getByTestId("dismiss"));

  expect(screen.getByTestId("is-prompting-login")).toHaveTextContent("false");
  expect(screen.getByTestId("access-token")).toHaveTextContent("null");
});
