import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import PinDetailsPage from "./PinDetailsPage";
import { withQueryClient } from "@/lib/testing-utils/misc";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_JSON,
} from "@/lib/testing-utils/mockAPIResponses";
import { API_URL_PIN_DETAILS } from "@/lib/constants";
import en from "@/public/locales/en/PinDetails.json";

const pinId = "000000000000000001";

const renderComponent = () => {
  const router = createMemoryRouter(
    [{ path: "/pin/:id", element: <PinDetailsPage /> }],
    { initialEntries: [`/pin/${pinId}`] },
  );

  render(withQueryClient(<RouterProvider router={router} />));
};

beforeEach(() => {
  fetchMock.resetMocks();
});

it("fetches pin details from the correct endpoint", () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_URL_PIN_DETAILS]);

  renderComponent();

  expect(fetch).toHaveBeenCalledWith(
    `${API_URL_PIN_DETAILS}/${pinId}/`,
  );
});

it("renders pin details upon successful fetch", async () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_URL_PIN_DETAILS]);

  renderComponent();

  await waitFor(() => {
    screen.getByText(MOCK_API_RESPONSES_JSON[API_URL_PIN_DETAILS].title);
  });
});

it("renders error view upon failed fetch", async () => {
  fetchMock.mockResponseOnce("{}", { status: 500 });

  renderComponent();

  await waitFor(() => {
    screen.getByText(en.ERROR_FETCH_PIN_DETAILS);
  });
});

it("renders 404 error view upon 404 response", async () => {
  fetchMock.mockResponseOnce("{}", { status: 404 });

  renderComponent();

  await waitFor(() => {
    screen.getByText(en.ERROR_PIN_NOT_FOUND);
  });
});
