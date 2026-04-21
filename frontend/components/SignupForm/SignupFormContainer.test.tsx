import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupFormContainer from "./SignupFormContainer";
import en from "@/public/locales/en/LandingPageContent.json";
import enCommon from "@/public/locales/en/Common.json";
import {
  ACCESS_TOKEN_EXPIRATION_DATE_LOCAL_STORAGE_KEY,
  API_ROUTE_SIGN_UP,
} from "@/lib/constants";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_JSON,
} from "@/lib/testing-utils/mockAPIResponses";

const handleClickAlreadyHaveAccount = () => {}; // NB: this behavior will be tested in <HeaderUnauthenticatedClient />

const mockReload = jest.fn();
Object.defineProperty(window, "location", {
  configurable: true,
  value: { ...window.location, reload: mockReload },
});

const renderComponent = () => {
  render(
    <SignupFormContainer
      handleClickAlreadyHaveAccount={handleClickAlreadyHaveAccount}
    />,
  );
};

it("displays relevant input errors", async () => {
  renderComponent();

  screen.getByText(en.SignupForm.FIND_NEW_IDEAS);

  const emailInput = screen.getByLabelText(en.SignupForm.EMAIL);
  const passwordInput = screen.getByLabelText(en.SignupForm.PASSWORD);
  const birthdateInput = screen.getByLabelText(en.SignupForm.BIRTHDATE);
  const submitButton = screen.getByText(en.SignupForm.CONTINUE);

  // Submit without any input:
  await userEvent.click(submitButton);

  screen.getByText(en.SignupForm.MISSING_EMAIL);

  // Type in email input, clear it and submit:
  await userEvent.type(emailInput, "test@example");
  await userEvent.clear(emailInput);
  await userEvent.click(submitButton);

  screen.getByText(en.SignupForm.MISSING_EMAIL);

  // Fill form with invalid email, invalid pasword and missing birthdate and submit:
  await userEvent.type(emailInput, "test@example");
  await userEvent.type(passwordInput, "Pa$$");
  await userEvent.click(submitButton);

  screen.getByText(en.SignupForm.INVALID_EMAIL_INPUT);

  // Fix email input but not password input or birthdate:
  await userEvent.type(emailInput, ".com");
  await userEvent.click(submitButton);

  expect(
    screen.queryByText(en.SignupForm.INVALID_EMAIL_INPUT),
  ).toBeNull();
  screen.getByText(en.SignupForm.INVALID_PASSWORD_INPUT);

  // Fix password input but not birthdate:
  await userEvent.type(passwordInput, "w0rd");
  expect(
    screen.queryByText(en.SignupForm.INVALID_PASSWORD_INPUT),
  ).toBeNull();
  await userEvent.click(submitButton);
  screen.getByText(en.SignupForm.INVALID_BIRTHDATE_INPUT);

  // Enter inexistent birthdate:
  await userEvent.type(birthdateInput, "1970-02-31");
  await userEvent.click(submitButton);
  screen.getByText(en.SignupForm.INVALID_BIRTHDATE_INPUT);

  // Enter birthdate in the future:
  await userEvent.clear(birthdateInput);
  await userEvent.type(birthdateInput, "2050-01-01");
  await userEvent.click(submitButton);
  screen.getByText(en.SignupForm.INVALID_BIRTHDATE_INPUT);

  // Fix birthdate input:
  await userEvent.clear(birthdateInput);
  await userEvent.type(birthdateInput, "1970-01-01");
  expect(
    screen.queryByText(en.SignupForm.INVALID_BIRTHDATE_INPUT),
  ).toBeNull();
});

it(`sets the access token's expiration date in local storage 
and reloads the page upon successful response`, async () => {
  renderComponent();

  const emailInput = screen.getByLabelText(en.SignupForm.EMAIL);
  const passwordInput = screen.getByLabelText(en.SignupForm.PASSWORD);
  const birthdateInput = screen.getByLabelText(en.SignupForm.BIRTHDATE);
  const submitButton = screen.getByText(en.SignupForm.CONTINUE);

  await userEvent.type(emailInput, "test@example.com");
  await userEvent.type(passwordInput, "Pa$$w0rd");
  await userEvent.type(birthdateInput, "1970-01-01");

  fetchMock.mockOnceIf(
    API_ROUTE_SIGN_UP,
    MOCK_API_RESPONSES[API_ROUTE_SIGN_UP],
    { status: 201 },
  );

  await userEvent.click(submitButton);

  expect(
    localStorage.getItem(ACCESS_TOKEN_EXPIRATION_DATE_LOCAL_STORAGE_KEY),
  ).toEqual(
    MOCK_API_RESPONSES_JSON[API_ROUTE_SIGN_UP].access_token_expiration_utc,
  );

  expect(mockReload).toHaveBeenCalledTimes(1);
});

it("displays relevant error when receiving KO responses", async () => {
  renderComponent();

  const emailInput = screen.getByLabelText(en.SignupForm.EMAIL);
  const passwordInput = screen.getByLabelText(en.SignupForm.PASSWORD);
  const birthdateInput = screen.getByLabelText(en.SignupForm.BIRTHDATE);
  const submitButton = screen.getByText(en.SignupForm.CONTINUE);

  await userEvent.type(emailInput, "test@example.com");
  await userEvent.type(passwordInput, "Pa$$w0rd");
  await userEvent.type(birthdateInput, "1970-01-01");

  fetchMock.mockOnceIf(
    API_ROUTE_SIGN_UP,
    JSON.stringify({ errors: [{ code: "invalid_email" }] }),
    { status: 400 },
  );
  await userEvent.click(submitButton);

  screen.getByText(en.SignupForm.INVALID_EMAIL_SIGNUP);

  fetchMock.mockOnceIf(
    API_ROUTE_SIGN_UP,
    JSON.stringify({ errors: [{ code: "invalid_password" }] }),
    { status: 400 },
  );
  await userEvent.type(passwordInput, "IsWr0ng");
  await userEvent.click(submitButton);

  screen.getByText(en.SignupForm.INVALID_PASSWORD_SIGNUP);

  fetchMock.mockOnceIf(
    API_ROUTE_SIGN_UP,
    JSON.stringify({ errors: [{ code: "invalid_birthdate" }] }),
    { status: 400 },
  );
  await userEvent.clear(passwordInput);
  await userEvent.type(passwordInput, "IsRight");
  await userEvent.click(submitButton);

  screen.getByText(en.SignupForm.INVALID_BIRTHDATE_SIGNUP);

  fetchMock.mockOnceIf(
    API_ROUTE_SIGN_UP,
    JSON.stringify({ errors: [{ code: "email_already_signed_up" }] }),
    { status: 400 },
  );
  await userEvent.clear(passwordInput);
  await userEvent.type(passwordInput, "IsRight");
  await userEvent.click(submitButton);

  screen.getByText(en.SignupForm.EMAIL_ALREADY_SIGNED_UP);

  fetchMock.mockOnceIf(API_ROUTE_SIGN_UP, "{}", {
    status: 400,
  });
  await userEvent.clear(passwordInput);
  await userEvent.type(passwordInput, "IsRight");
  await userEvent.click(submitButton);

  screen.getByText(enCommon.UNFORESEEN_ERROR);
});

it("displays loading state while expecting response", async () => {
  renderComponent();

  const emailInput = screen.getByLabelText(en.SignupForm.EMAIL);
  const passwordInput = screen.getByLabelText(en.SignupForm.PASSWORD);
  const birthdateInput = screen.getByLabelText(en.SignupForm.BIRTHDATE);
  const submitButton = screen.getByText(en.SignupForm.CONTINUE);

  const eternalPromise = new Promise<Response>(() => {});
  fetchMock.mockImplementationOnce(() => eternalPromise);

  await userEvent.type(emailInput, "test@example.com");
  await userEvent.type(passwordInput, "Pa$$w0rd");
  await userEvent.type(birthdateInput, "1970-01-01");
  await userEvent.click(submitButton);

  screen.getByTestId("signup-form-loading-overlay");
});
