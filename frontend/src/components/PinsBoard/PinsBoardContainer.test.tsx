import { render, waitFor, act, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import en from "@/public/locales/en/PinsBoard.json";
import PinsBoardContainer from "./PinsBoardContainer";
import { ToastContainer } from "react-toastify";
import { API_ROUTE_PIN_SUGGESTIONS } from "@/lib/constants";
import { mockIntersectionObserver } from "@/lib/testing-utils/misc";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_JSON,
  MOCK_API_RESPONSES_SERIALIZED,
} from "@/lib/testing-utils/mockAPIResponses";

const initialPins =
  MOCK_API_RESPONSES_SERIALIZED[API_ROUTE_PIN_SUGGESTIONS].results;

const simulateScrollToBottomOfPage = () => {
  const callback = (global.IntersectionObserver as jest.Mock).mock.calls[1][0]; // here
  // we pick the second call because a first intersection will be detected upon
  // initial render, but will not trigger a fetch. It's the second intersection event
  // that should trigger the fetch.

  act(() => {
    callback([{ isIntersecting: true }]);
  });
};

beforeEach(() => {
  mockIntersectionObserver();
});

const renderComponent = () => {
  render(
    <MemoryRouter>
      <ToastContainer />
      <PinsBoardContainer
        initialPins={initialPins}
        fetchPinsAPIRoute={API_ROUTE_PIN_SUGGESTIONS}
      />
    </MemoryRouter>,
  );
};

it("fetches new thumbnails when user scrolls to bottom", async () => {
  fetchMock.mockOnceIf(
    `${API_ROUTE_PIN_SUGGESTIONS}?page=2`,
    MOCK_API_RESPONSES[API_ROUTE_PIN_SUGGESTIONS],
  );

  renderComponent();

  await simulateScrollToBottomOfPage();

  await waitFor(() => {
    const renderedPinThumbnails = screen.getAllByTestId("pin-thumbnail");

    const expectedNumberThumbnails =
      initialPins.length +
      MOCK_API_RESPONSES_JSON[API_ROUTE_PIN_SUGGESTIONS].results.length;

    expect(renderedPinThumbnails).toHaveLength(expectedNumberThumbnails);
  });
});

it("displays loading spinner while fetching new thumbnails", () => {
  const eternalPromise = new Promise<Response>(() => {});
  fetchMock.mockImplementationOnce(() => eternalPromise);

  renderComponent();

  expect(screen.queryByTestId("loading-spinner")).toBeNull();

  simulateScrollToBottomOfPage();

  screen.getByTestId("loading-spinner");
});

it("displays error message in case of KO response upon new thumbnails fetch", async () => {
  fetchMock.mockOnceIf(`${API_ROUTE_PIN_SUGGESTIONS}?page=2`, "{}", {
    status: 400,
  });

  renderComponent();

  simulateScrollToBottomOfPage();

  await waitFor(() => {
    screen.getByText(en.ERROR_DISPLAY_PINS);
  });
});
