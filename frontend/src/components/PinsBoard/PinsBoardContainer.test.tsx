import { render, waitFor, act, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import en from "@/public/locales/en/PinsBoard.json";
import PinsBoardContainer from "./PinsBoardContainer";
import { ToastContainer } from "react-toastify";
import { API_URL_PIN_SUGGESTIONS } from "@/lib/constants";
import { mockIntersectionObserver, withQueryClient } from "@/lib/testing-utils/misc";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_JSON,
} from "@/lib/testing-utils/mockAPIResponses";

const simulateScrollToBottom = async () => {
  // PinsBoard is only rendered after page 1 has loaded (the container shows
  // SpinnerBelowHeader while loading), so the board is always non-empty when
  // the observer is first created. Only one observer exists (index 0).
  const callback = (global.IntersectionObserver as jest.Mock).mock.calls[0][0];

  act(() => {
    callback([{ isIntersecting: true }]);
  });
};

beforeEach(() => {
  fetchMock.resetMocks();
  mockIntersectionObserver();
});

const renderComponent = () => {
  render(
    withQueryClient(
      <MemoryRouter>
        <ToastContainer />
        <PinsBoardContainer
          queryKey={["pin-suggestions"]}
          fetchPinsAPIRoute={API_URL_PIN_SUGGESTIONS}
        />
      </MemoryRouter>,
    ),
  );
};

it("fetches new thumbnails when user scrolls to bottom", async () => {
  fetchMock.mockOnceIf(
    API_URL_PIN_SUGGESTIONS,
    MOCK_API_RESPONSES[API_URL_PIN_SUGGESTIONS],
  );
  fetchMock.mockOnceIf(
    `${API_URL_PIN_SUGGESTIONS}?page=2`,
    MOCK_API_RESPONSES[API_URL_PIN_SUGGESTIONS],
  );

  renderComponent();

  await waitFor(() =>
    expect(screen.getAllByTestId("pin-thumbnail").length).toBeGreaterThan(0),
  );

  await simulateScrollToBottom();

  await waitFor(() => {
    const renderedPinThumbnails = screen.getAllByTestId("pin-thumbnail");
    const expectedNumberThumbnails =
      2 * MOCK_API_RESPONSES_JSON[API_URL_PIN_SUGGESTIONS].results.length;
    expect(renderedPinThumbnails).toHaveLength(expectedNumberThumbnails);
  });
});

it("displays loading spinner while fetching new thumbnails", async () => {
  fetchMock.mockOnceIf(
    API_URL_PIN_SUGGESTIONS,
    MOCK_API_RESPONSES[API_URL_PIN_SUGGESTIONS],
  );

  renderComponent();

  await waitFor(() =>
    expect(screen.getAllByTestId("pin-thumbnail").length).toBeGreaterThan(0),
  );

  expect(screen.queryByTestId("loading-spinner")).toBeNull();

  const eternalPromise = new Promise<Response>(() => {});
  fetchMock.mockImplementationOnce(() => eternalPromise);

  await simulateScrollToBottom();

  await waitFor(() => screen.getByTestId("loading-spinner"));
});

it("displays error message in case of KO response upon new thumbnails fetch", async () => {
  fetchMock.mockOnceIf(
    API_URL_PIN_SUGGESTIONS,
    MOCK_API_RESPONSES[API_URL_PIN_SUGGESTIONS],
  );
  fetchMock.mockOnceIf(`${API_URL_PIN_SUGGESTIONS}?page=2`, "{}", {
    status: 400,
  });

  renderComponent();

  await waitFor(() =>
    expect(screen.getAllByTestId("pin-thumbnail").length).toBeGreaterThan(0),
  );

  simulateScrollToBottom();

  await waitFor(() => {
    screen.getByText(en.ERROR_DISPLAY_PINS);
  });
});
