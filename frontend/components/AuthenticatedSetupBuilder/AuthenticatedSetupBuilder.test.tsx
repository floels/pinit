import { withQueryClient } from "@/lib/testing-utils/misc";
import { render, waitFor } from "@testing-library/react";
import AuthenticatedSetupBuilder from "./AuthenticatedSetupBuilder";
import {
  API_ROUTE_MY_ACCOUNT_DETAILS,
  API_ROUTE_REFRESH_TOKEN,
} from "@/lib/constants";
import { AuthContextProvider } from "@/contexts/authContext";
import { MOCK_API_RESPONSES } from "@/lib/testing-utils/mockAPIResponses";

const mockLogOut = jest.fn();

jest.mock("@/lib/hooks/useLogOut", () => ({
  useLogOut: () => mockLogOut,
}));

beforeEach(() => {
  fetchMock.resetMocks();
});

const renderComponent = () => {
  render(
    <AuthContextProvider>
      {withQueryClient(<AuthenticatedSetupBuilder />)}
    </AuthContextProvider>,
  );
};

it("refreshes the access token on load, then fetches account details", async () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_ROUTE_REFRESH_TOKEN]);
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_ROUTE_MY_ACCOUNT_DETAILS]);

  renderComponent();

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      API_ROUTE_REFRESH_TOKEN,
      expect.objectContaining({ method: "POST", credentials: "include" }),
    );
  });

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      API_ROUTE_MY_ACCOUNT_DETAILS,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer mock.access.token.refresh",
        }),
      }),
    );
  });
});

it("does not fetch account details when refresh fails", async () => {
  fetchMock.mockResponseOnce("{}", { status: 401 });

  renderComponent();

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      API_ROUTE_REFRESH_TOKEN,
      expect.anything(),
    );
  });

  expect(fetch).toHaveBeenCalledTimes(1);
});
