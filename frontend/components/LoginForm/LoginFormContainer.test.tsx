import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginFormContainer from "./LoginFormContainer";
import en from "@/public/locales/en/LandingPageContent.json";
import enCommon from "@/public/locales/en/Common.json";
import {
  ACCESS_TOKEN_EXPIRATION_DATE_LOCAL_STORAGE_KEY,
  API_ROUTE_OBTAIN_DEMO_TOKEN,
  API_ROUTE_OBTAIN_TOKEN,
} from "@/lib/constants";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_JSON,
} from "@/lib/testing-utils/mockAPIResponses";
import { MockLocalStorage } from "@/lib/testing-utils/misc";

localStorage = new MockLocalStorage();

const mockReload = jest.fn();
Object.defineProperty(window, "location", {
  configurable: true,
  value: { ...window.location, reload: mockReload },
});

const typeInEmailInput = async (text: string) => {
  const emailInput = screen.getByLabelText(en.LoginForm.EMAIL);

  await userEvent.type(emailInput, text);
};

const typeInPasswordInput = async (text: string) => {
  const passwordInput = screen.getByLabelText(en.LoginForm.PASSWORD);

  await userEvent.type(passwordInput, text);
};

const clearPasswordInput = async () => {
  const passwordInput = screen.getByLabelText(en.LoginForm.PASSWORD);

  await userEvent.clear(passwordInput);
};

const submit = async () => {
  const submitButton = screen.getByTestId("login-form-submit-button");

  await userEvent.click(submitButton);
};

const handleClickNoAccountYet = () => {}; // NB: this behavior will be tested in <HeaderUnauthenticatedClient />

const renderComponent = () => {
  render(
    <LoginFormContainer handleClickNoAccountYet={handleClickNoAccountYet} />,
  );
};

beforeEach(() => {
  mockReload.mockClear();
});

it("displays relevant input errors", async () => {
  renderComponent();

  screen.getByText(en.LoginForm.WELCOME_TO_PINIT);

  // Submit without any input:
  await submit();

  screen.getByText(en.LoginForm.MISSING_EMAIL);

  // Fill form with invalid email and password and submit:
  await typeInEmailInput("test@example");
  await typeInPasswordInput("Pa$$");
  await submit();

  screen.getByText(en.LoginForm.INVALID_EMAIL_INPUT);

  // Fix email but not password:
  await typeInEmailInput(".com");
  await submit();

  expect(screen.queryByText(en.LoginForm.INVALID_EMAIL_INPUT)).toBeNull();
  screen.getByText(en.LoginForm.INVALID_PASSWORD_INPUT);

  // Fix password input:
  await typeInPasswordInput("w0rd");
  expect(
    screen.queryByText(en.LoginForm.INVALID_PASSWORD_INPUT),
  ).toBeNull();
});

it(`sets the access token's expiration date in local storage 
and reloads the page upon successful response`, async () => {
  renderComponent();

  await typeInEmailInput("test@example.com");
  await typeInPasswordInput("Pa$$w0rd");

  fetchMock.mockOnceIf(
    API_ROUTE_OBTAIN_TOKEN,
    MOCK_API_RESPONSES[API_ROUTE_OBTAIN_TOKEN],
  );

  await submit();

  expect(
    localStorage.getItem(ACCESS_TOKEN_EXPIRATION_DATE_LOCAL_STORAGE_KEY),
  ).toEqual(
    MOCK_API_RESPONSES_JSON[API_ROUTE_OBTAIN_TOKEN].access_token_expiration_utc,
  );

  expect(mockReload).toHaveBeenCalledTimes(1);
});

it(`sets the access token's expiration date in local storage 
and reloads the page upon successful response for demo login`, async () => {
  renderComponent();

  fetchMock.mockOnceIf(
    API_ROUTE_OBTAIN_DEMO_TOKEN,
    MOCK_API_RESPONSES[API_ROUTE_OBTAIN_TOKEN],
  );

  const demoLoginButton = screen.getByText(en.LoginForm.LOG_IN_AS_DEMO);
  await userEvent.click(demoLoginButton);

  expect(
    localStorage.getItem(ACCESS_TOKEN_EXPIRATION_DATE_LOCAL_STORAGE_KEY),
  ).toEqual(
    MOCK_API_RESPONSES_JSON[API_ROUTE_OBTAIN_TOKEN].access_token_expiration_utc,
  );

  expect(mockReload).toHaveBeenCalledTimes(1);
});

it("displays relevant errors when receiving KO responses", async () => {
  renderComponent();

  await typeInEmailInput("test@example.com");
  await typeInPasswordInput("Pa$$w0rd");

  fetchMock.mockOnceIf(
    API_ROUTE_OBTAIN_TOKEN,
    JSON.stringify({ errors: [{ code: "invalid_email" }] }),
    { status: 401 },
  );

  await submit();

  screen.getByText(en.LoginForm.INVALID_EMAIL_LOGIN);

  fetchMock.mockOnceIf(
    API_ROUTE_OBTAIN_TOKEN,
    JSON.stringify({ errors: [{ code: "invalid_password" }] }),
    { status: 401 },
  );
  await clearPasswordInput();
  await typeInPasswordInput("IsWr0ng");

  await submit();
  screen.getByText(en.LoginForm.INVALID_PASSWORD_LOGIN);

  fetchMock.mockOnceIf(API_ROUTE_OBTAIN_TOKEN, "{}", {
    status: 400,
  });
  await clearPasswordInput();
  await typeInPasswordInput("IsRight");

  await submit();
  screen.getByText(enCommon.UNFORESEEN_ERROR);
});

it("displays loading state while expecting network response", async () => {
  renderComponent();

  const eternalPromise = new Promise<Response>(() => {});
  fetchMock.mockImplementationOnce(() => eternalPromise);

  await typeInEmailInput("test@example.com");
  await typeInPasswordInput("Pa$$w0rd");
  await submit();

  screen.getByTestId("login-form-loading-overlay");
});
