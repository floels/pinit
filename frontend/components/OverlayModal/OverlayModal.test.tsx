import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import OverlayModal from "./OverlayModal";

const mockOnClose = jest.fn();

const renderComponent = () => {
  render(
    <OverlayModal onClose={mockOnClose}>
      <div />
    </OverlayModal>,
  );
};

beforeEach(() => {
  mockOnClose.mockReset();
});

it("calls onClose when user clicks on close button", async () => {
  renderComponent();

  const closeButton = screen.getByTestId("overlay-modal-close-button");
  await userEvent.click(closeButton);

  expect(mockOnClose).toHaveBeenCalledTimes(1);
});

it("calls onClose when user presses Escape", async () => {
  renderComponent();

  await userEvent.keyboard("[Escape]");

  expect(mockOnClose).toHaveBeenCalledTimes(1);
});
