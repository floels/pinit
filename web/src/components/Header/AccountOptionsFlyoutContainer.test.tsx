import type { Mock } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import AccountOptionsFlyoutContainer from "./AccountOptionsFlyoutContainer";
import userEvent from "@testing-library/user-event";
import { AccountContext } from "@/contexts/accountContext";
import { MOCK_API_RESPONSES_SERIALIZED } from "@/lib/testing-utils/mockAPIResponses";
import { API_URL_MY_ACCOUNT_DETAILS } from "@/lib/constants";

vi.mock("@/lib/hooks/useLogOut");
import { useLogOut } from "@/lib/hooks/useLogOut";

const mockLogOut = vi.fn();

const mockHandleClickOutOfAccountOptionsFlyout = vi.fn();

const defaultAccount = MOCK_API_RESPONSES_SERIALIZED[API_URL_MY_ACCOUNT_DETAILS];

const renderComponent = () => {
  render(
    <AccountContext.Provider
      value={{
        account: defaultAccount,
        setAccount: vi.fn(),
        isFetchError: false,
      }}
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
  (useLogOut as Mock).mockReturnValue(mockLogOut);
  mockLogOut.mockReset();
});

it("calls logOut and shows loading overlay upon clicking 'Log out'", async () => {
  mockLogOut.mockReturnValue(new Promise(() => {})); // never resolves

  renderComponent();

  await userEvent.click(screen.getByTestId("account-options-flyout-log-out-button"));

  expect(mockLogOut).toHaveBeenCalledTimes(1);
  screen.getByTestId("full-page-loading-overlay");
});

// NB: the "click out" behavior is tested in "HeaderAuthenticatedContainer.test.tsx"
