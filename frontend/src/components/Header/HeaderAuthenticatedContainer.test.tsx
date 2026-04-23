import React from "react";
import userEvent from "@testing-library/user-event";
import { screen, fireEvent, render, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import en from "@/public/locales/en/HeaderAuthenticated.json";
import HeaderAuthenticatedContainer from "./HeaderAuthenticatedContainer";
import { MockLocalStorage } from "@/lib/testing-utils/misc";
import {
  API_ROUTE_MY_ACCOUNT_DETAILS,
  PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY,
  USERNAME_LOCAL_STORAGE_KEY,
} from "@/lib/constants";
import { AccountContext } from "@/contexts/accountContext";
import { HeaderSearchBarContextProvider } from "@/contexts/headerSearchBarContext";
import { MOCK_API_RESPONSES_SERIALIZED } from "@/lib/testing-utils/mockAPIResponses";
import { AccountWithPrivateDetails } from "@/lib/types/frontendTypes";

jest.mock("@/components/Header/AccountOptionsFlyout", () => {
  const MockedAccountOptionsFlyout = React.forwardRef(() => (
    <div data-testid="mock-account-options-flyout" />
  ));

  MockedAccountOptionsFlyout.displayName = "AccountOptionsFlyout";

  return MockedAccountOptionsFlyout;
});

localStorage = new MockLocalStorage();

const defaultAccount =
  MOCK_API_RESPONSES_SERIALIZED[API_ROUTE_MY_ACCOUNT_DETAILS];

const renderComponent = ({
  account = defaultAccount,
}: {
  account?: AccountWithPrivateDetails | null;
} = {}) => {
  render(
    <MemoryRouter>
      <AccountContext.Provider value={{ account, setAccount: jest.fn() }}>
        <HeaderSearchBarContextProvider>
          <HeaderAuthenticatedContainer />
        </HeaderSearchBarContextProvider>
      </AccountContext.Provider>
    </MemoryRouter>,
  );
};

beforeEach(() => {
  localStorage.clear();
});

it("displays tooltip for profile link upon hover", () => {
  renderComponent();

  const profileLink = screen.getByTestId("profile-link");

  expect(screen.queryByText(en.YOUR_PROFILE)).toBeNull();

  fireEvent.mouseEnter(profileLink);
  screen.getByText(en.YOUR_PROFILE);

  fireEvent.mouseLeave(profileLink);
  expect(screen.queryByText(en.YOUR_PROFILE)).toBeNull();
});

it("displays tooltip for account options button upon hover", () => {
  renderComponent();

  const accountOptionsButton = screen.getByTestId("account-options-button");

  expect(screen.queryByText(en.ACCOUNT_OPTIONS)).toBeNull();

  fireEvent.mouseEnter(accountOptionsButton);
  screen.getByText(en.ACCOUNT_OPTIONS);

  fireEvent.mouseLeave(accountOptionsButton);
  expect(screen.queryByText(en.ACCOUNT_OPTIONS)).toBeNull();
});

it("displays account options flyout upon click on corresponding button, and close upon hitting Escape key", async () => {
  renderComponent();

  const accountOptionsButton = screen.getByTestId("account-options-button");

  expect(screen.queryByTestId("mock-account-options-flyout")).toBeNull();

  await userEvent.click(accountOptionsButton);

  screen.getByTestId("mock-account-options-flyout");

  await userEvent.keyboard("[Escape]");

  expect(screen.queryByTestId("mock-account-options-flyout")).toBeNull();
});

it("closes account options button when clicking out", async () => {
  renderComponent();

  const accountOptionsButton = screen.getByTestId("account-options-button");

  await userEvent.click(accountOptionsButton);

  screen.getByTestId("mock-account-options-flyout");

  await userEvent.click(document.body);

  expect(screen.queryByTestId("mock-account-options-flyout")).toBeNull();
});

it(`displays profile link with proper 'href' attribute
when username is available in account context`, () => {
  renderComponent();

  const profileLink = screen.getByTestId("profile-link");

  expect(profileLink).toHaveAttribute("href", `/${defaultAccount.username}`);
});

it(`displays profile picture with proper 'src' attribute when
profile picture URL is available in account context`, () => {
  renderComponent();

  const profilePicture = screen.getByTestId("profile-picture");
  expect(profilePicture.getAttribute("src")).toBe(defaultAccount.profilePictureURL);
});

it(`displays profile picture in 'Your profile' link if account context
is not yet available, but a username and a profile picture URL were found in
local storage`, async () => {
  const profilePictureURL = "https://some.domain.com/profile-picture.jpb";

  localStorage.setItem(USERNAME_LOCAL_STORAGE_KEY, "johndoe");
  localStorage.setItem(
    PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY,
    profilePictureURL,
  );

  renderComponent({ account: null });

  await waitFor(() => {
    const profilePicture = screen.getByTestId("profile-picture");

    expect(profilePicture.getAttribute("src")).toBe(profilePictureURL);
  });
});

it(`displays icon in 'Your profile' link if account context is not
yet available, no profile picture URL was found in local storage,
but username was found in local storage`, () => {
  localStorage.setItem(USERNAME_LOCAL_STORAGE_KEY, "johndoe");

  renderComponent({ account: null });

  screen.getByTestId("profile-link-icon");
});
