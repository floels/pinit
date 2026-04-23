import { API_ROUTE_REFRESH_TOKEN } from "@/lib/constants";
import { render, waitFor } from "@testing-library/react";
import AccessTokenRefresher from "./AccessTokenRefresher";
import { withQueryClient } from "@/lib/testing-utils/misc";
import { MOCK_API_RESPONSES } from "@/lib/testing-utils/mockAPIResponses";
import { AuthContext } from "@/contexts/authContext";

const mockHandleFinishedFetching = jest.fn();
const mockSetAccessToken = jest.fn();

const renderComponent = () => {
  render(
    <AuthContext.Provider
      value={{ accessToken: null, setAccessToken: mockSetAccessToken }}
    >
      {withQueryClient(
        <AccessTokenRefresher
          handleFinishedFetching={mockHandleFinishedFetching}
        />,
      )}
    </AuthContext.Provider>,
  );
};

beforeEach(() => {
  fetchMock.resetMocks();
  mockHandleFinishedFetching.mockReset();
  mockSetAccessToken.mockReset();
});

it("calls refresh endpoint on page load", () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_ROUTE_REFRESH_TOKEN]);

  renderComponent();

  expect(fetch).toHaveBeenCalledWith(
    API_ROUTE_REFRESH_TOKEN,
    expect.objectContaining({ method: "POST", credentials: "include" }),
  );
});

it("stores access token in context and calls handleFinishedFetching on success", async () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_ROUTE_REFRESH_TOKEN]);

  renderComponent();

  await waitFor(() => {
    expect(mockSetAccessToken).toHaveBeenCalledWith(
      "mock.access.token.refresh",
    );
    expect(mockHandleFinishedFetching).toHaveBeenCalledTimes(1);
  });
});

it("calls handleFinishedFetching without setting token on KO response", async () => {
  fetchMock.mockResponseOnce("{}", { status: 401 });

  renderComponent();

  await waitFor(() => {
    expect(mockHandleFinishedFetching).toHaveBeenCalledTimes(1);
  });

  expect(mockSetAccessToken).not.toHaveBeenCalled();
});
