import { render, screen, waitFor } from "@testing-library/react";
import { AuthContextProvider, useAuthContext } from "./authContext";
import { API_URL_REFRESH_TOKEN } from "@/lib/constants";
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
