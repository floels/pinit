import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import AccountDetailsPage from "./AccountDetailsPage";
import { withQueryClient } from "@/lib/testing-utils/misc";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_JSON,
} from "@/lib/testing-utils/mockAPIResponses";
import { API_URL_ACCOUNT_DETAILS } from "@/lib/constants";
import en from "@/public/locales/en/AccountDetails.json";

const username = "johndoe";

const renderComponent = () => {
  const router = createMemoryRouter(
    [{ path: "/:username", element: <AccountDetailsPage /> }],
    { initialEntries: [`/${username}`] },
  );

  render(withQueryClient(<RouterProvider router={router} />));
};

beforeEach(() => {
  fetchMock.resetMocks();
});

it("fetches account details from the correct endpoint", () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_URL_ACCOUNT_DETAILS]);

  renderComponent();

  expect(fetch).toHaveBeenCalledWith(
    `${API_URL_ACCOUNT_DETAILS}/${username}/`,
  );
});

it("renders account details upon successful fetch", async () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_URL_ACCOUNT_DETAILS]);

  renderComponent();

  await waitFor(() => {
    screen.getByText(
      MOCK_API_RESPONSES_JSON[API_URL_ACCOUNT_DETAILS].display_name,
    );
  });
});

it("renders error view upon failed fetch", async () => {
  fetchMock.mockResponseOnce("{}", { status: 500 });

  renderComponent();

  await waitFor(() => {
    screen.getByText(en.ERROR_FETCH_ACCOUNT_DETAILS);
  });
});

it("renders 404 error view upon 404 response", async () => {
  fetchMock.mockResponseOnce("{}", { status: 404 });

  renderComponent();

  await waitFor(() => {
    screen.getByText(en.ERROR_ACCOUNT_NOT_FOUND);
  });
});
