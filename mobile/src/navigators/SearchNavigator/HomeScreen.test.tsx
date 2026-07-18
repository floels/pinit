import {
  fireEvent,
  render,
  screen,
  userEvent,
  waitFor,
  within,
} from "@testing-library/react-native";

import HomeScreen from "./HomeScreen";

import { AUTOCOMPLETE_DEBOUNCE_TIME_MS } from "@/src/components/PinsSearchInput/PinsSearchInputContainer";
import {
  API_BASE_URL,
  API_ENDPOINT_SEARCH_SUGGESTIONS,
} from "@/src/lib/constants";
import { pressButton } from "@/src/lib/testing-utils/misc";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_JSON,
} from "@/src/lib/testing-utils/mockAPIResponses";

const mockNavigation = {
  navigate: jest.fn(),
} as any;

const endpoint = `${API_BASE_URL}/${API_ENDPOINT_SEARCH_SUGGESTIONS}`;

const renderComponent = () => {
  render(<HomeScreen navigation={mockNavigation} />);
};

const focusSearchInput = () => {
  const searchInput = screen.getByTestId("pins-search-input-text-input");

  fireEvent(searchInput, "focus");
};

const typeInSearchInput = async (input: string) => {
  const searchInput = screen.getByTestId("pins-search-input-text-input");

  await userEvent.type(searchInput, input);
};

const submitSearchInput = () => {
  const searchInput = screen.getByTestId("pins-search-input-text-input");

  fireEvent(searchInput, "submitEditing");
};

beforeEach(() => {
  fetchMock.resetMocks();
});

it("displays search input with search icon initially", () => {
  renderComponent();

  screen.getByTestId("pins-search-input-search-icon");
});

it("hides search input upon input focus", () => {
  renderComponent();

  focusSearchInput();

  expect(screen.queryByTestId("pins-search-input-search-icon")).toBeNull();
});

it("shows 'Clear' icon only when user starts typing in search input", async () => {
  renderComponent();

  focusSearchInput();

  expect(screen.queryByTestId("pins-search-input-clear-icon")).toBeNull();

  await typeInSearchInput("a");

  screen.getByTestId("pins-search-input-clear-icon");
});

it("clears input and hides clear icon when user presses 'Clear' icon", async () => {
  renderComponent();

  await typeInSearchInput("abc");

  const searchInput = screen.getByTestId("pins-search-input-text-input");
  expect(searchInput.props.value).toEqual("abc");

  pressButton({ testID: "pins-search-input-clear-icon" });

  expect(searchInput.props.value).toEqual("");

  expect(screen.queryByTestId("pins-search-input-clear-icon")).toBeNull();
});

it("clears input and shows search icon again when user presses 'Cancel'", async () => {
  renderComponent();

  await typeInSearchInput("abc");

  pressButton({ testID: "pins-search-input-cancel-button" });

  const searchInput = screen.getByTestId("pins-search-input-text-input");
  expect(searchInput.props.value).toEqual("");

  screen.getByTestId("pins-search-input-search-icon");
});

it(`displays search suggestions as user types, with search input as first suggestion,
and clear suggestions when user clears input`, async () => {
  renderComponent();

  fetchMock.mockOnceIf(
    `${endpoint}?search=foo`,
    MOCK_API_RESPONSES[API_ENDPOINT_SEARCH_SUGGESTIONS],
  );

  await typeInSearchInput("foo");

  await waitFor(() => {
    const searchSuggestions = screen.queryAllByTestId("search-suggestion-item");

    expect(searchSuggestions.length).toEqual(
      MOCK_API_RESPONSES_JSON[API_ENDPOINT_SEARCH_SUGGESTIONS].results.length +
        1,
    );

    within(searchSuggestions[0]).getByText("foo"); // search term should appear as first suggestion
    within(searchSuggestions[1]).getByText("foo suggestion 1");
  });
});

it("does not repeat search input as first suggestion if it is already included in suggestions", async () => {
  fetchMock.mockOnceIf(
    `${endpoint}?search=foo`,
    JSON.stringify({
      results: [
        "foo",
        ...MOCK_API_RESPONSES_JSON[API_ENDPOINT_SEARCH_SUGGESTIONS].results,
      ],
    }),
  );

  renderComponent();

  await typeInSearchInput("foo");

  await waitFor(() => {
    const searchSuggestions = screen.queryAllByTestId("search-suggestion-item");

    expect(searchSuggestions.length).toEqual(
      MOCK_API_RESPONSES_JSON[API_ENDPOINT_SEARCH_SUGGESTIONS].results.length +
        1,
    );
    within(searchSuggestions[0]).getByText("foo"); // search term should appear as first suggestion
    within(searchSuggestions[1]).getByText("foo suggestion 1");
  });
});

it("does not display any suggestion upon malformed OK response", async () => {
  fetchMock.mockOnceIf(`${endpoint}?search=foo`, "");

  renderComponent();

  await typeInSearchInput("foo");

  expect(screen.queryByTestId("search-suggestion-item")).toBeNull();
});

it("does not display any suggestion upon KO response", async () => {
  renderComponent();

  fetchMock.mockOnceIf(
    `${endpoint}?search=foo`,
    MOCK_API_RESPONSES[API_ENDPOINT_SEARCH_SUGGESTIONS],
  );

  await typeInSearchInput("foo");

  await waitFor(() => {
    expect(
      screen.queryAllByTestId("search-suggestion-item").length,
    ).toBeGreaterThan(0);
  });

  fetchMock.mockOnceIf(`${endpoint}?search=foobar`, "{}", {
    status: 400,
  });

  await typeInSearchInput("bar");

  await waitFor(() => {
    expect(screen.queryByTestId("search-suggestion-item")).toBeNull();
  });
});

it("does not display any suggestions upon fetch error", async () => {
  renderComponent();

  fetchMock.mockOnceIf(
    `${endpoint}?search=foo`,
    MOCK_API_RESPONSES[API_ENDPOINT_SEARCH_SUGGESTIONS],
  );

  await typeInSearchInput("foo");

  await waitFor(() => {
    expect(
      screen.queryAllByTestId("search-suggestion-item").length,
    ).toBeGreaterThan(0);
  });

  fetchMock.mockRejectOnce();

  await typeInSearchInput("bar");

  await waitFor(() => {
    expect(screen.queryByTestId("search-suggestion-item")).toBeNull();
  });
});

it("fetches only once if user types second character within debounce time", async () => {
  jest.useFakeTimers();

  renderComponent();

  await typeInSearchInput("a");

  jest.advanceTimersByTime(AUTOCOMPLETE_DEBOUNCE_TIME_MS / 2);

  await typeInSearchInput("b");

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenLastCalledWith(`${endpoint}?search=ab`);
  });

  jest.clearAllTimers();
  jest.useRealTimers();
});

it("fetches twice if user types second character after debounce time", async () => {
  jest.useFakeTimers();

  renderComponent();

  await typeInSearchInput("a");

  await waitFor(() => {
    expect(fetch).toHaveBeenLastCalledWith(`${endpoint}?search=a`);
  });

  jest.advanceTimersByTime(AUTOCOMPLETE_DEBOUNCE_TIME_MS * 2);

  await typeInSearchInput("b");

  await waitFor(() => {
    expect(fetch).toHaveBeenLastCalledWith(`${endpoint}?search=ab`);
  });

  jest.clearAllTimers();
  jest.useRealTimers();
});

it("navigates to search results screen upon submitting search input", async () => {
  renderComponent();

  await typeInSearchInput("foo");

  submitSearchInput();

  expect(mockNavigation.navigate).toHaveBeenLastCalledWith(
    "Authenticated.Browse.Main.Search.Results",
    {
      searchTerm: "foo",
    },
  );
});

it("navigates to search results screen upon pressing search suggestion item", async () => {
  fetchMock.mockOnceIf(
    `${endpoint}?search=foo`,
    MOCK_API_RESPONSES[API_ENDPOINT_SEARCH_SUGGESTIONS],
  );

  renderComponent();

  await typeInSearchInput("foo");

  await waitFor(() => {
    const searchSuggestions = screen.queryAllByTestId("search-suggestion-item");

    expect(searchSuggestions.length).toBeGreaterThan(0);
  });

  const firstSuggestionItem = screen.getByText("foo suggestion 1");

  fireEvent.press(firstSuggestionItem);

  expect(mockNavigation.navigate).toHaveBeenLastCalledWith(
    "Authenticated.Browse.Main.Search.Results",
    {
      searchTerm: "foo suggestion 1",
    },
  );
});
