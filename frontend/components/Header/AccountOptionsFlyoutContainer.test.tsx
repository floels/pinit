import { render, screen } from "@testing-library/react";
import AccountOptionsFlyoutContainer from "./AccountOptionsFlyoutContainer";
import userEvent from "@testing-library/user-event";

jest.mock("@/components/LogoutTrigger/LogoutTrigger", () => {
  const MockedLogoutTrigger = () => <div data-testid="mock-logout-trigger" />;

  MockedLogoutTrigger.displayName = "LogoutTrigger";

  return MockedLogoutTrigger;
});

jest.mock("js-cookie", () => ({
  set: jest.fn(),
}));

const mockHandleClickOutOfAccountOptionsFlyout = jest.fn();

const renderComponent = () => {
  render(
    <>
      <AccountOptionsFlyoutContainer
        handleClickOutOfAccountOptionsFlyout={
          mockHandleClickOutOfAccountOptionsFlyout
        }
      />
      <div data-testid="trigger-click-out" />
    </>,
  );
};

it("renders <LogoutTrigger /> upon clicking 'Log out'", async () => {
  renderComponent();

  expect(screen.queryByTestId("mock-logout-trigger")).toBeNull();

  const logoutButton = screen.getByTestId(
    "account-options-flyout-log-out-button",
  );

  await userEvent.click(logoutButton);

  screen.getByTestId("mock-logout-trigger");
});

// NB: the "click out" behavior is tested in "HeaderAuthenticatedContainer.test.tsx"
