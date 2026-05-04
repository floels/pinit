import en from "@/public/locales/en/LandingPageContent.json";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import FifthFold from "./FifthFold";

const mockOnClickBackToTop = jest.fn();

const fifthFold = <FifthFold onClickBackToTop={mockOnClickBackToTop} />;

it(`should switch to login form upon click on 'Already have an account',
and back to signup form upon click on 'No account yet'`, async () => {
  render(fifthFold);

  const alreadyHaveAccountButton = screen.getByText(
    en.SignupForm.ALREADY_HAVE_ACCOUNT_CTA,
  );
  await userEvent.click(alreadyHaveAccountButton);

  const noAccountYetButton = screen.getByText(
    en.LoginForm.NO_ACCOUNT_YET_CTA,
  );
  await userEvent.click(noAccountYetButton);

  screen.getByText(en.SignupForm.ALREADY_HAVE_ACCOUNT_CTA);
});

it("calls onClickBackToTop when corresponding button is clicked", async () => {
  render(fifthFold);

  const backToTopButton = screen.getByTestId("back-to-top-button");

  await userEvent.click(backToTopButton);

  expect(mockOnClickBackToTop).toHaveBeenCalledTimes(1);
});
