import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import AccountOptionsFlyoutContainer from "./AccountOptionsFlyoutContainer";
import userEvent from "@testing-library/user-event";
import { TypesOfAccount } from "@/lib/types/frontendTypes";

jest.mock("@/components/LogoutTrigger/LogoutTrigger", () => {
  const MockedLogoutTrigger = () => <div data-testid="mock-logout-trigger" />;

  MockedLogoutTrigger.displayName = "LogoutTrigger";

  return MockedLogoutTrigger;
});

const mockHandleClickOutOfAccountOptionsFlyout = jest.fn();

const renderComponent = () => {
  render(
    <>
      <AccountOptionsFlyoutContainer
        displayName="John Doe"
        initial="J"
        profilePictureURL={null}
        accountType={TypesOfAccount.PERSONAL}
        ownerEmail="john.doe@example.com"
        handleClickOutOfAccountOptionsFlyout={
          mockHandleClickOutOfAccountOptionsFlyout
        }
        openerRef={createRef<HTMLButtonElement>()}
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
