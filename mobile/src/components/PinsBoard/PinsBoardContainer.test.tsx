import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { FetchMock } from "jest-fetch-mock";

import PinsBoardContainer, {
  DEBOUNCE_TIME_REFRESH_MS,
  DEBOUNCE_TIME_SCROLL_DOWN_TO_FETCH_MORE_PINS_MS,
} from "./PinsBoardContainer";

import { AuthenticationContext } from "@/src/contexts/authenticationContext";
import {
  API_BASE_URL,
  API_ENDPOINT_PIN_SUGGESTIONS,
} from "@/src/lib/constants";
import { withQueryClient } from "@/src/lib/testing-utils/misc";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_JSON,
} from "@/src/lib/testing-utils/mockAPIResponses";
import enTranslations from "@/translations/en.json";

const MOCKED_PIN_THUMBNAIL_HEIGHT = 500;
const SCROLL_VIEW_HEIGHT = (MOCKED_PIN_THUMBNAIL_HEIGHT * 50) / 2;

jest.mock("expo-secure-store", () => ({
  getItemAsync: () => "access_token",
  deleteItemAsync: jest.fn(), // used by clearStoredAuthData on a 401
})); // needed to be able to fetch with authentication

jest.mock("@/src/components/PinsBoard/PinThumbnail", () => {
  const View = jest.requireActual("react-native").View;

  return (props: any) => (
    <View
      style={{ height: MOCKED_PIN_THUMBNAIL_HEIGHT }}
      testID={`mocked-pin-thumbnail-${props.pin.id}`}
    />
  );
});

jest.mock("@/src/components/Spinner/Spinner", () => {
  const View = jest.requireActual("react-native").View;

  return (props: any) => <View testID="mocked-spinner" />;
});

// To simulate the response upon refresh, simply shift the 'unique_id' of each pin:
const mockPinSuggestions =
  MOCK_API_RESPONSES_JSON[API_ENDPOINT_PIN_SUGGESTIONS].results;

const mockRefreshedPinSuggestions = mockPinSuggestions.map((result, index) => ({
  ...result,
  unique_id: String(mockPinSuggestions.length + index).padStart(18, "0"),
}));

const pinSuggestionsEndpoint = `${API_BASE_URL}/${API_ENDPOINT_PIN_SUGGESTIONS}`;

const mockDispatch = jest.fn();

const mockGetTapHandlerForPin = () => () => {};

const renderComponent = (props?: any) => {
  const initialState = {
    isCheckingAccessToken: false,
    isAuthenticated: true,
  };

  render(
    withQueryClient(
      <AuthenticationContext.Provider
        value={{ state: initialState, dispatch: mockDispatch }}
      >
        <PinsBoardContainer
          fetchEndpoint={pinSuggestionsEndpoint}
          getTapHandlerForPin={mockGetTapHandlerForPin}
          emptyResultsMessageKey="SearchScreen.NO_RESULTS"
          {...props}
        />
      </AuthenticationContext.Provider>,
    ),
  );
};

const scrollToBottom = () => {
  const scrollView = screen.getByTestId("pins-board-scroll-view");

  fireEvent.scroll(scrollView, {
    nativeEvent: {
      contentOffset: { y: SCROLL_VIEW_HEIGHT },
      contentSize: { height: SCROLL_VIEW_HEIGHT },
    },
  });
};

const pullToRefresh = () => {
  const scrollView = screen.getByTestId("pins-board-scroll-view");

  fireEvent.scroll(scrollView, {
    nativeEvent: {
      contentOffset: {
        y: -200,
      },
      contentSize: {
        height: SCROLL_VIEW_HEIGHT,
      },
    },
  });
};

beforeEach(() => {
  fetchMock.resetMocks();
});

afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});

it(`fetches and renders first page of pin suggestions upon initial render,
and fetches second page upon scroll`, async () => {
  jest.useFakeTimers();

  fetchMock.mockOnceIf(
    `${pinSuggestionsEndpoint}?page=1`,
    MOCK_API_RESPONSES[API_ENDPOINT_PIN_SUGGESTIONS],
  );

  renderComponent();

  await waitFor(() => {
    const pinThumbnails = screen.queryAllByTestId(/^mocked-pin-thumbnail-/);
    expect(pinThumbnails.length).toEqual(mockPinSuggestions.length);
  });

  act(() => {
    jest.advanceTimersByTime(
      2 * DEBOUNCE_TIME_SCROLL_DOWN_TO_FETCH_MORE_PINS_MS,
    );
  });

  const scrollView = screen.getByTestId("pins-board-scroll-view");
  fireEvent.scroll(scrollView, {
    nativeEvent: {
      contentOffset: {
        y: SCROLL_VIEW_HEIGHT,
      },
      contentSize: {
        height: SCROLL_VIEW_HEIGHT,
      },
    },
  });

  await waitFor(() => {
    expect(fetch as FetchMock).toHaveBeenLastCalledWith(
      `${pinSuggestionsEndpoint}?page=2`,
    );
  });
});

it("stops fetching further pages once a page comes back empty", async () => {
  jest.useFakeTimers();

  fetchMock.mockOnceIf(
    `${pinSuggestionsEndpoint}?page=1`,
    MOCK_API_RESPONSES[API_ENDPOINT_PIN_SUGGESTIONS],
  );
  fetchMock.mockOnceIf(
    `${pinSuggestionsEndpoint}?page=2`,
    JSON.stringify({ results: [] }),
  );

  renderComponent();

  await waitFor(() => {
    expect(screen.queryAllByTestId(/^mocked-pin-thumbnail-/).length).toEqual(
      mockPinSuggestions.length,
    );
  });

  act(() => {
    jest.advanceTimersByTime(
      2 * DEBOUNCE_TIME_SCROLL_DOWN_TO_FETCH_MORE_PINS_MS,
    );
  });

  scrollToBottom();

  await waitFor(() => {
    expect(fetch as FetchMock).toHaveBeenLastCalledWith(
      `${pinSuggestionsEndpoint}?page=2`,
    );
  });

  (fetch as FetchMock).mockClear();

  act(() => {
    jest.advanceTimersByTime(
      2 * DEBOUNCE_TIME_SCROLL_DOWN_TO_FETCH_MORE_PINS_MS,
    );
  });

  scrollToBottom();

  jest.useRealTimers();

  await new Promise((resolve) => setTimeout(resolve, 1)); // Without this wait,
  // the assertion below would be inoperative, meaning it would pass even if the
  // board asked for a third page.

  expect(fetch).not.toHaveBeenCalled();
});

it("fetches through the fetcher it is given", async () => {
  // A board of an authenticated endpoint receives 'fetchAuthenticated' from
  // 'useAPI'. The board itself carries no notion of a token.
  const mockFetchFn = jest.fn().mockResolvedValue(
    new Response(MOCK_API_RESPONSES[API_ENDPOINT_PIN_SUGGESTIONS], {
      status: 200,
    }),
  );

  renderComponent({ fetchFn: mockFetchFn });

  await waitFor(() => {
    expect(mockFetchFn).toHaveBeenCalledWith(
      `${pinSuggestionsEndpoint}?page=1`,
    );
  });

  expect(fetch).not.toHaveBeenCalled();
});

it("displays relevant message if search results are empty", async () => {
  fetchMock.mockOnceIf(
    `${pinSuggestionsEndpoint}?page=1`,
    JSON.stringify({
      results: [],
    }),
  );

  renderComponent();

  await waitFor(() => {
    screen.getByText(enTranslations.SearchScreen.NO_RESULTS);
  });
});

it("displays spinner while fetching initial pins", async () => {
  const eternalPromise = new Promise<Response>(() => {});
  fetchMock.mockImplementationOnce(() => eternalPromise);

  renderComponent();

  screen.getByTestId("mocked-spinner");
});

it("displays error message upon 400 response when fetching initial pins", async () => {
  fetchMock.mockOnceIf(`${pinSuggestionsEndpoint}?page=1`, "{}", {
    status: 400,
  });

  renderComponent();

  await waitFor(() => {
    screen.getByText(enTranslations.Common.ERROR_FETCH_MORE_PINS);
  });
});

it(`refreshes pins when pulling to refresh, and does not refresh
again if user pulls again within debounce time`, async () => {
  jest.useFakeTimers();

  fetchMock.mockOnceIf(
    `${pinSuggestionsEndpoint}?page=1`,
    MOCK_API_RESPONSES[API_ENDPOINT_PIN_SUGGESTIONS],
  );

  renderComponent();

  fetchMock.mockOnceIf(
    `${pinSuggestionsEndpoint}?page=1`,
    JSON.stringify({
      results: mockRefreshedPinSuggestions,
    }),
  );

  pullToRefresh();

  await waitFor(() => {
    screen.getByTestId("mocked-pin-thumbnail-000000000000000050");
  });

  (fetch as FetchMock).mockReset();

  jest.advanceTimersByTime(DEBOUNCE_TIME_REFRESH_MS / 2);

  pullToRefresh();

  jest.useRealTimers();

  await new Promise((resolve) => setTimeout(resolve, 1)); // Without this wait,
  // the following assertion would be inoperative, meaning it would
  // pass even if there was a bug that led the component to fetch again.

  expect(fetch).not.toHaveBeenCalled();
});

it(`refreshes pins when pulling to refresh, and refreshes
again if user pulls again after debounce time`, async () => {
  jest.useFakeTimers();

  fetchMock.mockOnceIf(
    `${pinSuggestionsEndpoint}?page=1`,
    MOCK_API_RESPONSES[API_ENDPOINT_PIN_SUGGESTIONS],
  );

  renderComponent();

  fetchMock.mockOnceIf(
    `${pinSuggestionsEndpoint}?page=1`,
    JSON.stringify({
      results: mockRefreshedPinSuggestions,
    }),
  );

  pullToRefresh();

  await waitFor(() => {
    screen.getByTestId("mocked-pin-thumbnail-000000000000000050");
  });

  (fetch as FetchMock).mockReset();
  expect(fetch).not.toHaveBeenCalled();

  fetchMock.mockOnceIf(
    `${pinSuggestionsEndpoint}?page=1`,
    JSON.stringify({
      results: mockRefreshedPinSuggestions,
    }),
  );

  act(() => {
    jest.advanceTimersByTime(DEBOUNCE_TIME_REFRESH_MS * 2);
  });

  pullToRefresh();

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(`${pinSuggestionsEndpoint}?page=1`);
  });
});

it(`displays error message upon 400 response on refresh,
and keeps the pins that were on screen`, async () => {
  jest.useFakeTimers();

  fetchMock.mockOnceIf(
    `${pinSuggestionsEndpoint}?page=1`,
    MOCK_API_RESPONSES[API_ENDPOINT_PIN_SUGGESTIONS],
  );

  renderComponent();

  await waitFor(() => {
    screen.getByTestId("mocked-pin-thumbnail-000000000000000000");
  });

  fetchMock.mockOnceIf(`${pinSuggestionsEndpoint}?page=1`, "{}", {
    status: 400,
  });

  pullToRefresh();

  await waitFor(() => {
    screen.getByText(enTranslations.Common.ERROR_REFRESH_PINS);
  });

  // A failed refresh must not empty the board: the pins the user was reading
  // stay on screen, and only the message reports the failure.
  expect(screen.queryAllByTestId(/^mocked-pin-thumbnail-/).length).toEqual(
    mockPinSuggestions.length,
  );
});
