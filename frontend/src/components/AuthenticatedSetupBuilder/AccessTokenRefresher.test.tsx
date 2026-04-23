import { API_URL_REFRESH_TOKEN } from "@/lib/constants";
import { render, waitFor } from "@testing-library/react";
import AccessTokenRefresher from "./AccessTokenRefresher";
import { withQueryClient } from "@/lib/testing-utils/misc";
import { MOCK_API_RESPONSES } from "@/lib/testing-utils/mockAPIResponses";
import { AuthContext } from "@/contexts/authContext";

const mockSetAccessToken = jest.fn();
const mockSetIsAuthInitialized = jest.fn();

const renderComponent = () => {
  render(
    <AuthContext.Provider
      value={{
        accessToken: null,
        setAccessToken: mockSetAccessToken,
        isAuthInitialized: false,
        setIsAuthInitialized: mockSetIsAuthInitialized,
      }}
    >
      {withQueryClient(<AccessTokenRefresher />)}
    </AuthContext.Provider>,
  );
};

beforeEach(() => {
  fetchMock.resetMocks();
  mockSetAccessToken.mockReset();
  mockSetIsAuthInitialized.mockReset();
});

it("calls refresh endpoint on page load", () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_URL_REFRESH_TOKEN]);

  renderComponent();

  expect(fetch).toHaveBeenCalledWith(
    API_URL_REFRESH_TOKEN,
    expect.objectContaining({ method: "POST", credentials: "include" }),
  );
});

it("stores access token in context and sets isAuthInitialized on success", async () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_URL_REFRESH_TOKEN]);

  renderComponent();

  await waitFor(() => {
    expect(mockSetAccessToken).toHaveBeenCalledWith(
      "mock.access.token.refresh",
    );
    expect(mockSetIsAuthInitialized).toHaveBeenCalledWith(true);
  });
});

it("sets isAuthInitialized without setting token on KO response", async () => {
  fetchMock.mockResponseOnce("{}", { status: 401 });

  renderComponent();

  await waitFor(() => {
    expect(mockSetIsAuthInitialized).toHaveBeenCalledWith(true);
  });

  expect(mockSetAccessToken).not.toHaveBeenCalled();
});
