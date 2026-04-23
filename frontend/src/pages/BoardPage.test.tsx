import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import BoardPage from "./BoardPage";
import { withQueryClient } from "@/lib/testing-utils/misc";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_JSON,
} from "@/lib/testing-utils/mockAPIResponses";
import { API_URL_BOARD_DETAILS } from "@/lib/constants";
import en from "@/public/locales/en/BoardDetails.json";

const username = "johndoe";
const slug = "board-1";

const renderComponent = () => {
  const router = createMemoryRouter(
    [{ path: "/:username/:slug", element: <BoardPage /> }],
    { initialEntries: [`/${username}/${slug}`] },
  );

  render(withQueryClient(<RouterProvider router={router} />));
};

beforeEach(() => {
  fetchMock.resetMocks();
});

it("fetches board details from the correct endpoint", () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_URL_BOARD_DETAILS]);

  renderComponent();

  expect(fetch).toHaveBeenCalledWith(
    `${API_URL_BOARD_DETAILS}/${username}/${slug}/`,
  );
});

it("renders board details upon successful fetch", async () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_URL_BOARD_DETAILS]);

  renderComponent();

  await waitFor(() => {
    screen.getByText(MOCK_API_RESPONSES_JSON[API_URL_BOARD_DETAILS].name);
  });
});

it("renders error view upon failed fetch", async () => {
  fetchMock.mockResponseOnce("{}", { status: 500 });

  renderComponent();

  await waitFor(() => {
    screen.getByText(en.ERROR_FETCH_BOARD_DETAILS);
  });
});

it("renders 404 error view upon 404 response", async () => {
  fetchMock.mockResponseOnce("{}", { status: 404 });

  renderComponent();

  await waitFor(() => {
    screen.getByText(en.ERROR_BOARD_NOT_FOUND);
  });
});
