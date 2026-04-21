import { act, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingPageContent, {
  SCROLLING_DEBOUNCING_TIME_MS,
  SCROLL_DIRECTIONS,
} from "./LandingPageContent";
import userEvent from "@testing-library/user-event";

const renderComponent = () => {
  render(
    <MemoryRouter>
      <LandingPageContent />
    </MemoryRouter>,
  );
};

// Since the <FifthFold /> component relies on `useRouter` and other
// specific methods, we mock the whole component for simplicity:
jest.mock("@/components/LandingPageContent/FifthFold", () => {
  const MockedFifthFold = ({
    onClickBackToTop,
  }: {
    onClickBackToTop: () => void;
  }) => (
    <div>
      <button
        data-testid="mock-button-back-to-top"
        onClick={onClickBackToTop}
      />
    </div>
  );

  MockedFifthFold.displayName = "FifthFold";

  return MockedFifthFold;
});

const scrollAfterDebounceTime = ({
  scrollDirection,
}: {
  scrollDirection: SCROLL_DIRECTIONS;
}) => {
  act(() => {
    jest.advanceTimersByTime(2 * SCROLLING_DEBOUNCING_TIME_MS);
  });

  const deltaY = scrollDirection === SCROLL_DIRECTIONS.DOWN ? 100 : -100;

  fireEvent.wheel(document, { deltaY });
};

it("scrolls from fold to fold, down and up", () => {
  jest.useFakeTimers();

  renderComponent();

  const content = screen.getByTestId("landing-page-content");
  expect(content.className).toEqual("content"); // i.e. first fold active

  fireEvent.wheel(document, { deltaY: 100 });
  expect(content.className).toEqual("content contentSecondFoldActive");

  scrollAfterDebounceTime({ scrollDirection: SCROLL_DIRECTIONS.DOWN });
  expect(content.className).toEqual("content contentThirdFoldActive");

  scrollAfterDebounceTime({ scrollDirection: SCROLL_DIRECTIONS.DOWN });
  expect(content.className).toEqual("content contentFourthFoldActive");

  scrollAfterDebounceTime({ scrollDirection: SCROLL_DIRECTIONS.DOWN });
  expect(content.className).toEqual("content contentFifthFoldActive");

  scrollAfterDebounceTime({ scrollDirection: SCROLL_DIRECTIONS.UP });
  expect(content.className).toEqual("content contentFourthFoldActive");

  scrollAfterDebounceTime({ scrollDirection: SCROLL_DIRECTIONS.UP });
  expect(content.className).toEqual("content contentThirdFoldActive");

  scrollAfterDebounceTime({ scrollDirection: SCROLL_DIRECTIONS.UP });
  expect(content.className).toEqual("content contentSecondFoldActive");

  jest.clearAllTimers();
  jest.useRealTimers();
});

it("does not scroll down to second fold in case of lateral wheel event", () => {
  renderComponent();

  fireEvent.wheel(document, { deltaX: 10 });

  const content = screen.getByTestId("landing-page-content");
  expect(content.className).toEqual("content");
});

it("does not move to third fold if user scrolls twice within debounce time", () => {
  jest.useFakeTimers();

  renderComponent();

  fireEvent.wheel(document, { deltaY: 100 });

  const content = screen.getByTestId("landing-page-content");

  expect(content.className).toEqual("content contentSecondFoldActive");

  act(() => {
    jest.advanceTimersByTime(0.5 * SCROLLING_DEBOUNCING_TIME_MS);
    fireEvent.wheel(document, { deltaY: 100 });
  });

  expect(content.className).toEqual("content contentSecondFoldActive");

  jest.clearAllTimers();
  jest.useRealTimers();
});

it("scrolls to second fold when user clicks on the hero carret", async () => {
  renderComponent();

  const heroCarret = screen.getByTestId("picture-slider-carret-icon");
  await userEvent.click(heroCarret);

  const content = screen.getByTestId("landing-page-content");
  expect(content.className).toEqual("content contentSecondFoldActive");
});

it("scrolls back to top upon click on 'send back to top'", async () => {
  jest.useFakeTimers();

  renderComponent();

  const content = screen.getByTestId("landing-page-content");

  fireEvent.wheel(document, { deltaY: 100 }); // now at second fold

  scrollAfterDebounceTime({ scrollDirection: SCROLL_DIRECTIONS.DOWN }); // now at third fold
  scrollAfterDebounceTime({ scrollDirection: SCROLL_DIRECTIONS.DOWN }); // now at fourth fold
  scrollAfterDebounceTime({ scrollDirection: SCROLL_DIRECTIONS.DOWN }); // now at fifth fold

  jest.useRealTimers();
  expect(content.className).toEqual("content contentFifthFoldActive");

  const backToTopButton = screen.getByTestId("mock-button-back-to-top");
  await userEvent.click(backToTopButton);

  expect(content.className).toEqual("content"); // i.e. first fold active

  jest.clearAllTimers();
});
