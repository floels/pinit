import { render } from "@testing-library/react-native";

import CreateSelectModal from "./CreateSelectModal";

import { pressButton } from "@/src/lib/testing-utils/misc";

const mockHandlePressCreatePin = jest.fn();

const mockHandleClose = jest.fn();

const renderComponent = () => {
  render(
    <CreateSelectModal
      handleClose={mockHandleClose}
      handlePressCreatePin={mockHandlePressCreatePin}
    />,
  );
};

it("calls 'handlePressCreatePin' upon click on 'Create Pin' button", async () => {
  renderComponent();

  pressButton({ testID: "create-pin-button" });

  expect(mockHandlePressCreatePin).toHaveBeenCalledTimes(1);
});

it("calls 'handleClose' upon click on close button", async () => {
  renderComponent();

  pressButton({ testID: "create-select-modal-close-button" });

  expect(mockHandleClose).toHaveBeenCalledTimes(1);
});
