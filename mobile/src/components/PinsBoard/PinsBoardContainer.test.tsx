import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { FetchMock } from "jest-fetch-mock";
import { Image } from "react-native";

import PinsBoardContainer, {
  DEBOUNCE_TIME_REFRESH_MS,
  DEBOUNCE_TIME_SCROLL_DOWN_TO_FETCH_MORE_PINS_MS,
} from "./PinsBoardContainer";

import { AuthenticationContext } from "@/src/contexts/authenticationContext";
import {
  API_BASE_URL,
  API_ENDPOINT_PIN_SUGGESTIONS,
} from "@/src/lib/constants";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_JSON,
} from "@/src/lib/testing-utils/mockAPIResponses";
import enTranslations from "@/translations/en.json";

const MOCKED_PIN_THUMBNAIL_HEIGHT = 500;
const SCROLL_VIEW_HEIGHT = (MOCKED_PIN_THUMBNAIL_HEIGHT * 50) / 2;

jest.mock("expo-secure-store", () => ({
  getItemAsync: () => "access_token",
})); // needed to be able to fetch with authentication

jest.mock("@/src/components/PinsBoard/PinThumbnail", () => {
  const View = jest.requireActual(
    "react-native/Libraries/Components/View/View",
  );

  return (props: any) => (
    <View
      style={{ height: MOCKED_PIN_THUMBNAIL_HEIGHT }}
      testID={`mocked-pin-thumbnail-${props.pin.id}`}
    />
  );
});

jest.mock("@/src/components/Spinner/Spinner", () => {
  const View = jest.requireActual(
    "react-native/Libraries/Components/View/View",
  );

  return (props: any) => <View testID="mocked-spinner" />;
});

Image.getSize = jest.fn();

(Image.getSize as jest.Mock).mockImplementation((_, success) => {
  success(100, MOCKED_PIN_THUMBNAIL_HEIGHT);
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
  );
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

it("fetches first page with authentication if relevant", async () => {
  renderComponent({ shouldAuthenticate: true });

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(`${pinSuggestionsEndpoint}?page=1`, {
      headers: { Authorization: "Bearer access_token" },
    });
  });
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

it("dispatches relevant action upon 401 response when fetching initial pins", async () => {
  fetchMock.mockOnceIf(`${pinSuggestionsEndpoint}?page=1`, "{}", {
    status: 401,
  });

  renderComponent();

  await waitFor(() => {
    expect(mockDispatch).toHaveBeenCalledWith({ type: "GOT_401_RESPONSE" });
  });
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

it("displays error message upon error in 'Image.getSize()' when fetching initial pins", async () => {
  fetchMock.mockOnceIf(
    `${pinSuggestionsEndpoint}?page=1`,
    MOCK_API_RESPONSES[API_ENDPOINT_PIN_SUGGESTIONS],
  );

  (Image.getSize as jest.Mock).mockImplementationOnce((_, __, error) => {
    error(new Error());
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

it("dispatches relevant action upon 401 response on refresh", async () => {
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
    status: 401,
  });

  pullToRefresh();

  await waitFor(() => {
    expect(mockDispatch).toHaveBeenCalledWith({ type: "GOT_401_RESPONSE" });
  });
});

it("displays error message upon 400 response on refresh", async () => {
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
});
