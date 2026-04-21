import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import HeaderSearchBarContainer, {
  AUTOCOMPLETE_DEBOUNCE_TIME_MS,
} from "./HeaderSearchBarContainer";
import { API_ROUTE_SEARCH_SUGGESTIONS } from "@/lib/constants";
import { HeaderSearchBarContextProvider } from "@/contexts/headerSearchBarContext";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_JSON,
} from "@/lib/testing-utils/mockAPIResponses";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

const typeSearchTerm = async (searchTerm: string) => {
  const searchInput = screen.getByTestId("search-bar-input");

  await userEvent.type(searchInput, searchTerm);
};

const clickSearchInput = async () => {
  const searchInput = screen.getByTestId("search-bar-input");

  await userEvent.click(searchInput);
};

const renderComponent = () => {
  render(
    <MemoryRouter>
      <HeaderSearchBarContextProvider>
        <HeaderSearchBarContainer />
      </HeaderSearchBarContextProvider>
    </MemoryRouter>,
  );
};

beforeEach(() => {
  fetchMock.resetMocks();
});

it("resets input value and blurs input upon pressing 'Escape'", async () => {
  renderComponent();

  const searchInput = screen.getByTestId("search-bar-input");

  await userEvent.type(searchInput, "abc");

  expect(document.activeElement).toEqual(searchInput);
  expect(searchInput).toHaveValue("abc");

  await userEvent.keyboard("[Escape]");

  await waitFor(() => {
    expect(searchInput).toHaveValue("");

    expect(document.activeElement).not.toEqual(searchInput);
  });
});

it("resets input value and blurs input upon pressing 'Clear' icon", async () => {
  renderComponent();

  const searchInput = screen.getByTestId("search-bar-input");

  await userEvent.type(searchInput, "abc");

  expect(document.activeElement).toEqual(searchInput);
  expect(searchInput).toHaveValue("abc");

  const clearIcon = screen.getByTestId("clear-icon");

  userEvent.click(clearIcon);

  await waitFor(() => {
    expect(searchInput).toHaveValue("");

    expect(document.activeElement).not.toEqual(searchInput);
  });
});

it("hides search icon when input gets focus", async () => {
  renderComponent();

  screen.getByTestId("search-icon");

  await clickSearchInput();

  expect(screen.queryByTestId("search-icon")).toBeNull();
});

it("displays search suggestions with search term as first suggestion", async () => {
  fetchMock.mockOnceIf(
    `${API_ROUTE_SEARCH_SUGGESTIONS}?search=foo`,
    MOCK_API_RESPONSES[API_ROUTE_SEARCH_SUGGESTIONS],
  );

  renderComponent();

  await typeSearchTerm("foo");

  await waitFor(() => {
    const searchSuggestionsListItems = screen.getAllByTestId(
      "search-suggestions-list-item",
    );

    expect(searchSuggestionsListItems).toHaveLength(7);

    expect(searchSuggestionsListItems[0]).toHaveTextContent("foo");
    expect(searchSuggestionsListItems[1]).toHaveTextContent("foo suggestion 1");
  });
});

it("displays search suggestions as such if search term is already among suggestions", async () => {
  fetchMock.mockOnceIf(
    `${API_ROUTE_SEARCH_SUGGESTIONS}?search=foo`,
    JSON.stringify({
      results: [
        "foo",
        ...MOCK_API_RESPONSES_JSON[API_ROUTE_SEARCH_SUGGESTIONS].results,
      ],
    }),
  );

  renderComponent();

  await typeSearchTerm("foo");

  await waitFor(() => {
    const searchSuggestionsListItems = screen.getAllByTestId(
      "search-suggestions-list-item",
    );

    expect(searchSuggestionsListItems).toHaveLength(7);

    expect(searchSuggestionsListItems[0]).toHaveTextContent("foo");
    expect(searchSuggestionsListItems[1]).toHaveTextContent("foo suggestion 1");
  });
});

it("navigates to search route when user clicks suggestion", async () => {
  fetchMock.mockOnceIf(
    `${API_ROUTE_SEARCH_SUGGESTIONS}?search=foo`,
    MOCK_API_RESPONSES[API_ROUTE_SEARCH_SUGGESTIONS],
  );

  renderComponent();

  await typeSearchTerm("foo");

  await waitFor(async () => {
    const searchSuggestionsListItems = screen.getAllByTestId(
      "search-suggestions-list-item",
    );

    await userEvent.click(searchSuggestionsListItems[1]);

    expect(mockNavigate).toHaveBeenLastCalledWith(
      "/search/pins?q=foo suggestion 1",
    );
  });
});

it("navigates to /search/pins route when user types and presses Enter", async () => {
  renderComponent();

  await typeSearchTerm("foo");

  await userEvent.keyboard("[Enter]");

  expect(mockNavigate).toHaveBeenLastCalledWith("/search/pins?q=foo");
});

it("does not display any suggestion in case of KO response from the API", async () => {
  renderComponent();

  // We need to start with a first successful request in order to trigger an
  // initial state change:
  fetchMock.mockOnceIf(
    `${API_ROUTE_SEARCH_SUGGESTIONS}?search=foo`,
    MOCK_API_RESPONSES[API_ROUTE_SEARCH_SUGGESTIONS],
  );

  await typeSearchTerm("foo");

  await waitFor(() => {
    screen.getByTestId("search-suggestions-list");
  });

  fetchMock.mockOnceIf(`${API_ROUTE_SEARCH_SUGGESTIONS}?search=foobar`, "{}", {
    status: 400,
  });

  await typeSearchTerm("bar");

  await waitFor(() => {
    expect(screen.queryByTestId("search-suggestions-list")).toBeNull();
  });
});

it("does not display any suggestion in case of fetch error", async () => {
  renderComponent();

  // We need to start with a first successful request in order to trigger an
  // initial state change:
  fetchMock.mockOnceIf(
    `${API_ROUTE_SEARCH_SUGGESTIONS}?search=foo`,
    MOCK_API_RESPONSES[API_ROUTE_SEARCH_SUGGESTIONS],
  );

  await typeSearchTerm("foo");

  await waitFor(() => {
    screen.getByTestId("search-suggestions-list");
  });

  fetchMock.mockRejectOnce();

  await typeSearchTerm("bar");

  await waitFor(() => {
    expect(screen.queryByTestId("search-suggestions-list")).toBeNull();
  });
});

it("fetches only once if two characters are typed within debounce time", async () => {
  renderComponent();

  await clickSearchInput();

  jest.useFakeTimers();

  userEvent.keyboard("a"); // Using `await` here would make the test time out, because of the `jest.useFakeTimers();`

  jest.advanceTimersByTime(AUTOCOMPLETE_DEBOUNCE_TIME_MS / 2);

  userEvent.keyboard("b"); // Using `await` here would make the test time out, because of the `jest.useFakeTimers();`

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenLastCalledWith(
      `${API_ROUTE_SEARCH_SUGGESTIONS}?search=ab`,
    );
  });

  jest.useRealTimers();
});

it("fetches twice if two characters are typed beyond debounce time", async () => {
  renderComponent();

  await clickSearchInput();

  jest.useFakeTimers();

  userEvent.keyboard("a"); // Using `await` here would make the test time out, because of the `jest.useFakeTimers();`

  await waitFor(() => {
    expect(fetch).toHaveBeenLastCalledWith(
      `${API_ROUTE_SEARCH_SUGGESTIONS}?search=a`,
    );
  });

  jest.advanceTimersByTime(AUTOCOMPLETE_DEBOUNCE_TIME_MS * 2);

  userEvent.keyboard("b"); // Using `await` here would make the test time out, because of the `jest.useFakeTimers();`

  await waitFor(() => {
    expect(fetch).toHaveBeenLastCalledWith(
      `${API_ROUTE_SEARCH_SUGGESTIONS}?search=ab`,
    );
  });

  jest.useRealTimers();
});
