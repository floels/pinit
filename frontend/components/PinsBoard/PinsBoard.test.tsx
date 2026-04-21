import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PinsBoard from "./PinsBoard";
import { mockIntersectionObserver } from "@/lib/testing-utils/misc";
import en from "@/public/locales/en/PinsSearch.json";
import { MOCK_API_RESPONSES_SERIALIZED } from "@/lib/testing-utils/mockAPIResponses";
import { API_ROUTE_PIN_SUGGESTIONS } from "@/lib/constants";

const VIEWPORT_WIDTH_PX = 1200;

Object.defineProperty(window, "innerWidth", {
  writable: true,
  configurable: true,
  value: VIEWPORT_WIDTH_PX,
});

const NUMBER_PINS = 50;

const pins = MOCK_API_RESPONSES_SERIALIZED[API_ROUTE_PIN_SUGGESTIONS].results;

const renderComponent = () => {
  render(
    <MemoryRouter>
      <PinsBoard
        pins={pins}
        isFetching={false}
        fetchFailed={false}
        onScrolledToBottom={jest.fn()}
      />
    </MemoryRouter>,
  );
};

beforeEach(() => {
  mockIntersectionObserver();
});

it("renders the thumbnails with the right number of columns", () => {
  renderComponent();

  const renderedPins = screen.getAllByTestId("pin-thumbnail");

  expect(renderedPins).toHaveLength(NUMBER_PINS);

  const thumbnailsColumns = screen.queryAllByTestId(/thumbnails-column-\d+/);

  expect(thumbnailsColumns).toHaveLength(4); // given `const VIEWPORT_WIDTH_PX = 1200;`
});

it("renders the right thumbnails in the right columns", () => {
  renderComponent();

  const firstColumn = screen.getByTestId("thumbnails-column-0");
  const secondColumn = screen.getByTestId("thumbnails-column-1");
  const thirdColumn = screen.getByTestId("thumbnails-column-2");
  const fourthColumn = screen.getByTestId("thumbnails-column-3");

  within(firstColumn).queryByText("Pin 1 title");
  within(secondColumn).queryByText("Pin 2 title");
  within(thirdColumn).queryByText("Pin 3 title");
  within(fourthColumn).queryByText("Pin 4 title");
  within(firstColumn).queryByText("Pin 5 title");
});

it("renders empty results message when pins table is empty", () => {
  render(
    <PinsBoard
      pins={[]}
      isFetching={false}
      fetchFailed={false}
      onScrolledToBottom={jest.fn()}
      emptyResultsMessageKey="PinsSearch.NO_RESULTS"
    />,
  );

  screen.getByText(en.NO_RESULTS);
});

// The rest of the component's behavior is tested in 'PinsBoardContainer.test.tsx'.
