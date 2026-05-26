import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LandingPageContent from "./LandingPageContent";
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
  const MockedFifthFold = ({ onClickBackToTop }: { onClickBackToTop: () => void }) => (
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

it("scrolls hero into view on mount", () => {
  const mockScrollIntoView = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

  renderComponent();

  expect(mockScrollIntoView).toHaveBeenCalledTimes(1);
  expect(mockScrollIntoView).toHaveBeenCalledWith(/* no args */);
});

it("scrolls to second fold when user clicks on the hero carret", async () => {
  const mockScrollIntoView = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

  renderComponent();
  mockScrollIntoView.mockClear(); // ignore the mount call

  const heroCarret = screen.getByTestId("picture-slider-carret-icon");
  await userEvent.click(heroCarret);

  expect(mockScrollIntoView).toHaveBeenCalledTimes(1);
  expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
});

it("scrolls back to top upon click on 'back to top'", async () => {
  const mockScrollIntoView = jest.fn();
  window.HTMLElement.prototype.scrollIntoView = mockScrollIntoView;

  renderComponent();
  mockScrollIntoView.mockClear();

  const backToTopButton = screen.getByTestId("mock-button-back-to-top");
  await userEvent.click(backToTopButton);

  expect(mockScrollIntoView).toHaveBeenCalledTimes(1);
  expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: "smooth" });
});
