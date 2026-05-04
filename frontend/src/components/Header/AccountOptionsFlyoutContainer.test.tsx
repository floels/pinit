import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import AccountOptionsFlyoutContainer from "./AccountOptionsFlyoutContainer";
import userEvent from "@testing-library/user-event";
import { AccountContext } from "@/contexts/accountContext";
import { MOCK_API_RESPONSES_SERIALIZED } from "@/lib/testing-utils/mockAPIResponses";
import { API_URL_MY_ACCOUNT_DETAILS } from "@/lib/constants";

const mockHandleClickOutOfAccountOptionsFlyout = jest.fn();

const defaultAccount = MOCK_API_RESPONSES_SERIALIZED[API_URL_MY_ACCOUNT_DETAILS];

const renderComponent = () => {
  render(
    <AccountContext.Provider
      value={{ account: defaultAccount, setAccount: jest.fn() }}
    >
      <AccountOptionsFlyoutContainer
        handleClickOutOfAccountOptionsFlyout={
          mockHandleClickOutOfAccountOptionsFlyout
        }
        openerRef={createRef<HTMLButtonElement>()}
      />
      <div data-testid="trigger-click-out" />
    </AccountContext.Provider>,
  );
};

it("renders loading overlay upon clicking 'Log out'", async () => {
  renderComponent();

  expect(screen.queryByTestId("logout-loading-overlay")).toBeNull();

  const logoutButton = screen.getByTestId(
    "account-options-flyout-log-out-button",
  );

  await userEvent.click(logoutButton);

  screen.getByTestId("logout-loading-overlay");
});

// NB: the "click out" behavior is tested in "HeaderAuthenticatedContainer.test.tsx"
