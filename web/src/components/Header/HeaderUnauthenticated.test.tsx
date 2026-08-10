import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import en from "@/public/locales/en/LandingPageContent.json";
import common from "@/public/locales/en/Common.json";
import {
  AuthenticationContext,
  AuthenticationContextType,
} from "@/contexts/authenticationContext";
import HeaderUnauthenticated from "./HeaderUnauthenticated";
import { MemoryRouter } from "react-router";
import { HeaderSearchBarContextProvider } from "@/contexts/headerSearchBarContext";
import { withQueryClient } from "@/lib/testing-utils/misc";

const mockStopPromptingLogin = vi.fn();

const buildAuthenticationContextValue = (
  overrides: Partial<AuthenticationContextType> = {},
): AuthenticationContextType => ({
  accessToken: null,
  setAccessToken: vi.fn(),
  isAuthInitialized: true,
  isPromptingLogin: false,
  clearSession: vi.fn(),
  endSession: vi.fn(),
  stopPromptingLogin: mockStopPromptingLogin,
  ...overrides,
});

const renderComponent = (
  pathname = "/some-page",
  authenticationContextValue = buildAuthenticationContextValue(),
) => {
  render(
    withQueryClient(
      <AuthenticationContext.Provider value={authenticationContextValue}>
        <MemoryRouter initialEntries={[pathname]}>
          <HeaderSearchBarContextProvider>
            <HeaderUnauthenticated />
          </HeaderSearchBarContextProvider>
        </MemoryRouter>
      </AuthenticationContext.Provider>,
    ),
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

it("renders without any modal open", () => {
  renderComponent();

  expect(screen.queryByTestId("overlay-modal")).toBeNull();
});

it("renders with search bar when pathname is not '/'", () => {
  renderComponent();

  screen.getByTestId("header-search-bar");
});

it("renders without search bar when pathname is '/'", () => {
  renderComponent("/");

  expect(screen.queryByTestId("header-search-bar")).toBeNull();
});

it(`opens login modal when user clicks on Login button,
and switches to signup modal when user clicks on 'Sign up'`, async () => {
  renderComponent();

  const logInButton = screen.getByTestId("header-log-in-button");

  await userEvent.click(logInButton);

  let modal = screen.getByTestId("overlay-modal");

  within(modal).getByText(en.LoginForm.WELCOME_TO_PINIT);

  const noAccountYet = screen.getByText(en.LoginForm.NO_ACCOUNT_YET_CTA);

  await userEvent.click(noAccountYet);

  modal = screen.getByTestId("overlay-modal");

  within(modal).getByText(en.SignupForm.FIND_NEW_IDEAS);
});

it(`opens signup modal when user clicks on Signup button,
and switches to login modal when user clicks on 'Log in'`, async () => {
  renderComponent();

  const signUpButton = screen.getByTestId("header-sign-up-button");

  await userEvent.click(signUpButton);

  let modal = screen.getByTestId("overlay-modal");

  within(modal).getByText(en.SignupForm.FIND_NEW_IDEAS);

  const alreadyHaveAccount = screen.getByText(
    en.SignupForm.ALREADY_HAVE_ACCOUNT_CTA,
  );

  await userEvent.click(alreadyHaveAccount);

  modal = screen.getByTestId("overlay-modal");

  expect(
    within(modal).queryByText(en.SignupForm.FIND_NEW_IDEAS),
  ).toBeNull();

  within(modal).getByText(en.LoginForm.WELCOME_TO_PINIT);
});

it("closes login modal when user clicks close button", async () => {
  renderComponent();

  const logInButton = screen.getByTestId("header-log-in-button");

  await userEvent.click(logInButton);

  screen.getByTestId("overlay-modal");

  const closeButton = screen.getByTestId("overlay-modal-close-button");

  await userEvent.click(closeButton);

  expect(screen.queryByTestId("overlay-modal")).toBeNull();
});

it("closes signup modal when user clicks close button", async () => {
  renderComponent();

  const signUpButton = screen.getByTestId("header-sign-up-button");

  await userEvent.click(signUpButton);

  screen.getByTestId("overlay-modal");

  const closeButton = screen.getByTestId("overlay-modal-close-button");

  await userEvent.click(closeButton);

  expect(screen.queryByTestId("overlay-modal")).toBeNull();
});

it(`opens the login modal with the reason when the session just expired,
without any click`, () => {
  renderComponent(
    "/some-page",
    buildAuthenticationContextValue({ isPromptingLogin: true }),
  );

  const modal = screen.getByTestId("overlay-modal");

  within(modal).getByText(en.LoginForm.WELCOME_TO_PINIT);
  within(modal).getByText(common.SESSION_EXPIRED);
});

it("shows no reason in the login modal when the user opens it themselves", async () => {
  renderComponent();

  await userEvent.click(screen.getByTestId("header-log-in-button"));

  const modal = screen.getByTestId("overlay-modal");

  within(modal).getByText(en.LoginForm.WELCOME_TO_PINIT);
  expect(within(modal).queryByText(common.SESSION_EXPIRED)).toBeNull();
});

it("stops prompting for a login when the user closes the modal", async () => {
  renderComponent(
    "/some-page",
    buildAuthenticationContextValue({ isPromptingLogin: true }),
  );

  await userEvent.click(screen.getByTestId("overlay-modal-close-button"));

  expect(screen.queryByTestId("overlay-modal")).toBeNull();
  expect(mockStopPromptingLogin).toHaveBeenCalledTimes(1);
});

it("stops prompting for a login when the user switches to signup", async () => {
  renderComponent(
    "/some-page",
    buildAuthenticationContextValue({ isPromptingLogin: true }),
  );

  await userEvent.click(screen.getByText(en.LoginForm.NO_ACCOUNT_YET_CTA));

  expect(mockStopPromptingLogin).toHaveBeenCalledTimes(1);
});
