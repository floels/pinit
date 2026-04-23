import { render, screen, waitFor } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import SearchPage from "./SearchPage";
import { withQueryClient } from "@/lib/testing-utils/misc";
import { mockIntersectionObserver } from "@/lib/testing-utils/misc";
import { MOCK_API_RESPONSES, MOCK_API_RESPONSES_JSON } from "@/lib/testing-utils/mockAPIResponses";
import { API_URL_SEARCH } from "@/lib/constants";
import en from "@/public/locales/en/PinsSearch.json";

const searchTerm = "mountains";

const renderComponent = ({ path = `/search/pins?q=${searchTerm}` } = {}) => {
  const router = createMemoryRouter(
    [
      { path: "/", element: <div>Home</div> },
      { path: "/search/pins", element: <SearchPage /> },
    ],
    { initialEntries: [path] },
  );

  render(withQueryClient(<RouterProvider router={router} />));
};

beforeEach(() => {
  fetchMock.resetMocks();
  mockIntersectionObserver();
});

it("fetches search results from the correct endpoint", () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_URL_SEARCH]);

  renderComponent();

  expect(fetch).toHaveBeenCalledWith(
    `${API_URL_SEARCH}?q=${searchTerm}`,
  );
});

it("renders search results upon successful fetch", async () => {
  fetchMock.mockResponseOnce(MOCK_API_RESPONSES[API_URL_SEARCH]);

  renderComponent();

  await waitFor(() => {
    screen.getByText(
      MOCK_API_RESPONSES_JSON[API_URL_SEARCH].results[0].title,
    );
  });
});

it("renders error view upon failed fetch", async () => {
  fetchMock.mockResponseOnce("{}", { status: 500 });

  renderComponent();

  await waitFor(() => {
    screen.getByText(en.ERROR_FETCH_SEARCH_RESULTS);
  });
});

it("redirects to home when no search term is provided", () => {
  renderComponent({ path: "/search/pins" });

  screen.getByText("Home");
});
