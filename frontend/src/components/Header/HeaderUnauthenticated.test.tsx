import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import en from "@/public/locales/en/LandingPageContent.json";
import HeaderUnauthenticated from "./HeaderUnauthenticated";
import { MemoryRouter } from "react-router-dom";
import { HeaderSearchBarContextProvider } from "@/contexts/headerSearchBarContext";

const renderComponent = (pathname = "/some-page") => {
  render(
    <MemoryRouter initialEntries={[pathname]}>
      <HeaderSearchBarContextProvider>
        <HeaderUnauthenticated />
      </HeaderSearchBarContextProvider>
    </MemoryRouter>,
  );
};

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
