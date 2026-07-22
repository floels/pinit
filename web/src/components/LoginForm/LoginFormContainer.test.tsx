import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LoginFormContainer from "./LoginFormContainer";
import en from "@/public/locales/en/LandingPageContent.json";
import enCommon from "@/public/locales/en/Common.json";
import { API_URL_OBTAIN_TOKEN } from "@/lib/constants";
import { MOCK_API_RESPONSES, MOCK_API_RESPONSES_JSON } from "@/lib/testing-utils/mockAPIResponses";
import { AuthContext } from "@/contexts/authContext";
import { withQueryClient } from "@/lib/testing-utils/misc";

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

const mockSetAccessToken = vi.fn();

const renderComponent = () => {
  render(
    withQueryClient(
      <AuthContext.Provider
        value={{ accessToken: null, setAccessToken: mockSetAccessToken, isAuthInitialized: false }}
      >
        <LoginFormContainer handleClickNoAccountYet={handleClickNoAccountYet} />
      </AuthContext.Provider>,
    ),
  );
};

beforeEach(() => {
  fetchMock.resetMocks();
  mockSetAccessToken.mockReset();
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

it("sets access token in context upon successful login", async () => {
  renderComponent();

  await typeInEmailInput("test@example.com");
  await typeInPasswordInput("Pa$$w0rd");

  fetchMock.mockOnceIf(
    API_URL_OBTAIN_TOKEN,
    MOCK_API_RESPONSES[API_URL_OBTAIN_TOKEN],
  );

  await submit();

  expect(mockSetAccessToken).toHaveBeenCalledWith(
    MOCK_API_RESPONSES_JSON[API_URL_OBTAIN_TOKEN].access_token,
  );
});

it("displays relevant errors when receiving KO responses", async () => {
  renderComponent();

  await typeInEmailInput("test@example.com");
  await typeInPasswordInput("Pa$$w0rd");

  fetchMock.mockOnceIf(
    API_URL_OBTAIN_TOKEN,
    JSON.stringify({ errors: [{ code: "invalid_email" }] }),
    { status: 401 },
  );

  await submit();

  screen.getByText(en.LoginForm.INVALID_EMAIL_LOGIN);

  fetchMock.mockOnceIf(
    API_URL_OBTAIN_TOKEN,
    JSON.stringify({ errors: [{ code: "invalid_password" }] }),
    { status: 401 },
  );
  await clearPasswordInput();
  await typeInPasswordInput("IsWr0ng");

  await submit();
  screen.getByText(en.LoginForm.INVALID_PASSWORD_LOGIN);

  fetchMock.mockOnceIf(API_URL_OBTAIN_TOKEN, "{}", {
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
