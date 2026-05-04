import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import AccountOptionsFlyoutContainer from "./AccountOptionsFlyoutContainer";
import userEvent from "@testing-library/user-event";
import { AccountContext } from "@/contexts/accountContext";
import { MOCK_API_RESPONSES_SERIALIZED } from "@/lib/testing-utils/mockAPIResponses";
import { API_URL_MY_ACCOUNT_DETAILS } from "@/lib/constants";

jest.mock("@/lib/hooks/useLogOut");
import { useLogOut } from "@/lib/hooks/useLogOut";

const mockLogOut = jest.fn();

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

beforeEach(() => {
  (useLogOut as jest.Mock).mockReturnValue(mockLogOut);
  mockLogOut.mockReset();
});

it("calls logOut upon clicking 'Log out'", async () => {
  renderComponent();

  await userEvent.click(screen.getByTestId("account-options-flyout-log-out-button"));

  expect(mockLogOut).toHaveBeenCalledTimes(1);
});

// NB: the "click out" behavior is tested in "HeaderAuthenticatedContainer.test.tsx"
