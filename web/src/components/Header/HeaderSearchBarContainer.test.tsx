import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import HeaderSearchBarContainer, {
  AUTOCOMPLETE_DEBOUNCE_TIME_MS,
} from "./HeaderSearchBarContainer";
import { API_URL_SEARCH_SUGGESTIONS } from "@/lib/constants";
import { HeaderSearchBarContextProvider } from "@/contexts/headerSearchBarContext";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_JSON,
} from "@/lib/testing-utils/mockAPIResponses";

const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }));

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
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

it("changes placeholder to 'Try a title or description' when input is focused", async () => {
  renderComponent();

  const searchInput = screen.getByTestId("search-bar-input");

  expect(searchInput).toHaveAttribute("placeholder", "Search");

  await clickSearchInput();

  expect(searchInput).toHaveAttribute("placeholder", "Try a title or description");
});

it("hides clear icon when input is focused but empty", async () => {
  renderComponent();

  await clickSearchInput();

  expect(screen.getByTestId("clear-icon")).toHaveClass("clearIconContainerHidden");
});

it("shows clear icon only when input has a value", async () => {
  renderComponent();

  await clickSearchInput();

  expect(screen.getByTestId("clear-icon")).toHaveClass("clearIconContainerHidden");

  await userEvent.type(screen.getByTestId("search-bar-input"), "a");

  expect(screen.getByTestId("clear-icon")).not.toHaveClass("clearIconContainerHidden");
});

it("displays search suggestions with search term as first suggestion", async () => {
  fetchMock.mockOnceIf(
    `${API_URL_SEARCH_SUGGESTIONS}?search=foo`,
    MOCK_API_RESPONSES[API_URL_SEARCH_SUGGESTIONS],
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
    `${API_URL_SEARCH_SUGGESTIONS}?search=foo`,
    JSON.stringify({
      results: [
        "foo",
        ...MOCK_API_RESPONSES_JSON[API_URL_SEARCH_SUGGESTIONS].results,
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
    `${API_URL_SEARCH_SUGGESTIONS}?search=foo`,
    MOCK_API_RESPONSES[API_URL_SEARCH_SUGGESTIONS],
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
    `${API_URL_SEARCH_SUGGESTIONS}?search=foo`,
    MOCK_API_RESPONSES[API_URL_SEARCH_SUGGESTIONS],
  );

  await typeSearchTerm("foo");

  await waitFor(() => {
    screen.getByTestId("search-suggestions-list");
  });

  fetchMock.mockOnceIf(`${API_URL_SEARCH_SUGGESTIONS}?search=foobar`, "{}", {
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
    `${API_URL_SEARCH_SUGGESTIONS}?search=foo`,
    MOCK_API_RESPONSES[API_URL_SEARCH_SUGGESTIONS],
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

// These debounce tests drive the input with synchronous `fireEvent` rather
// than `userEvent`: userEvent's pointer/keyboard flows await internal timers
// that deadlock under `vi.useFakeTimers()`. fireEvent lets us control the
// clock explicitly while only the app's debounce timer is in play.
it("fetches only once if two characters are typed within debounce time", async () => {
  renderComponent();

  const searchInput = screen.getByTestId("search-bar-input");
  fireEvent.focus(searchInput);

  vi.useFakeTimers();

  fireEvent.change(searchInput, { target: { value: "a" } });

  vi.advanceTimersByTime(AUTOCOMPLETE_DEBOUNCE_TIME_MS / 2);

  fireEvent.change(searchInput, { target: { value: "ab" } });

  await vi.advanceTimersByTimeAsync(AUTOCOMPLETE_DEBOUNCE_TIME_MS);

  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenLastCalledWith(
    `${API_URL_SEARCH_SUGGESTIONS}?search=ab`,
  );

  vi.useRealTimers();
});

it("fetches twice if two characters are typed beyond debounce time", async () => {
  renderComponent();

  const searchInput = screen.getByTestId("search-bar-input");
  fireEvent.focus(searchInput);

  vi.useFakeTimers();

  fireEvent.change(searchInput, { target: { value: "a" } });

  await vi.advanceTimersByTimeAsync(AUTOCOMPLETE_DEBOUNCE_TIME_MS);

  expect(fetch).toHaveBeenLastCalledWith(
    `${API_URL_SEARCH_SUGGESTIONS}?search=a`,
  );

  fireEvent.change(searchInput, { target: { value: "ab" } });

  await vi.advanceTimersByTimeAsync(AUTOCOMPLETE_DEBOUNCE_TIME_MS);

  expect(fetch).toHaveBeenLastCalledWith(
    `${API_URL_SEARCH_SUGGESTIONS}?search=ab`,
  );

  vi.useRealTimers();
});
