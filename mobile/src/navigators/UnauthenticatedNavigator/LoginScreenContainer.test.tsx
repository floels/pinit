import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  render,
  screen,
  userEvent,
  fireEvent,
  waitFor,
} from "@testing-library/react-native";
import * as SecureStore from "expo-secure-store";

import LoginScreenContainer from "./LoginScreenContainer";

import { AuthenticationContext } from "@/src/contexts/authenticationContext";
import {
  ACCESS_TOKEN_EXPIRATION_DATE_STORAGE_KEY,
  ACCESS_TOKEN_STORAGE_KEY,
  API_BASE_URL,
  API_ENDPOINT_OBTAIN_TOKEN,
  ERROR_CODE_INVALID_EMAIL,
  REFRESH_TOKEN_STORAGE_KEY,
} from "@/src/lib/constants";
import { pressButton } from "@/src/lib/testing-utils/misc";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_JSON,
} from "@/src/lib/testing-utils/mockAPIResponses";
import enTranslations from "@/translations/en.json";

jest.mock("expo-secure-store", () => ({
  setItemAsync: jest.fn(),
}));

const mockNavigation = {
  goBack: jest.fn(),
} as any;

const mockDispatch = jest.fn();

const endpoint = `${API_BASE_URL}/${API_ENDPOINT_OBTAIN_TOKEN}`;

const renderComponent = () => {
  const initialState = {
    isCheckingAccessToken: false,
    isAuthenticated: false,
  };

  render(
    <AuthenticationContext.Provider
      value={{ state: initialState, dispatch: mockDispatch }}
    >
      <LoginScreenContainer navigation={mockNavigation} />
    </AuthenticationContext.Provider>,
  );
};

const typeInEmailInput = async (text: string) => {
  const emailInput = screen.getByPlaceholderText(
    enTranslations.LandingScreen.PLACEHOLDER_EMAIL,
  );
  await userEvent.type(emailInput, text);
};

const typeInPasswordInput = async (text: string) => {
  const passwordInput = screen.getByPlaceholderText(
    enTranslations.LandingScreen.PLACEHOLDER_PASSWORD,
  );
  await userEvent.type(passwordInput, text);
};

const fillInputsWithValidCredentials = async () => {
  await typeInEmailInput("john.doe@example.com");

  await typeInPasswordInput("Pa$$w0rd");
};

const pressSubmit = () => {
  pressButton({ testID: "login-screen-submit-button" });
};

it("calls 'navigation.goBack()' when pressing Close icon", async () => {
  renderComponent();

  pressButton({ testID: "login-screen-close-icon" });

  expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
});

it("toggles password visibility upon press of corresponding icon", async () => {
  renderComponent();

  const passwordInput = screen.getByPlaceholderText(
    enTranslations.LandingScreen.PLACEHOLDER_PASSWORD,
  );

  expect(passwordInput.props.secureTextEntry).toBe(true);

  const togglePasswordVisibilityIcon = screen.getByTestId(
    "login-screen-toggle-password-visibility-icon",
  );

  fireEvent.press(togglePasswordVisibilityIcon);
  expect(passwordInput.props.secureTextEntry).toBe(false);

  fireEvent.press(togglePasswordVisibilityIcon);
  expect(passwordInput.props.secureTextEntry).toBe(true);
});

it("does not enable submit button before inputs are valid", async () => {
  renderComponent();

  const submitButton = screen.getByTestId("login-screen-submit-button");

  expect(submitButton).toBeDisabled();

  await typeInEmailInput("john.doe@example.com");

  expect(submitButton).toBeDisabled();

  await typeInPasswordInput("$h0rt");

  expect(submitButton).toBeDisabled();

  await typeInPasswordInput("I$N0WL0ng€nough");

  expect(submitButton).toBeEnabled();
});

it("persists tokens data and dispatch 'LOGGED_IN' action upon successful login", async () => {
  renderComponent();

  await fillInputsWithValidCredentials();

  fetchMock.mockOnceIf(endpoint, MOCK_API_RESPONSES[API_ENDPOINT_OBTAIN_TOKEN]);

  pressSubmit();

  await waitFor(() => {
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      ACCESS_TOKEN_STORAGE_KEY,
      MOCK_API_RESPONSES_JSON[API_ENDPOINT_OBTAIN_TOKEN].access_token,
    );
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
      REFRESH_TOKEN_STORAGE_KEY,
      MOCK_API_RESPONSES_JSON[API_ENDPOINT_OBTAIN_TOKEN].refresh_token,
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      ACCESS_TOKEN_EXPIRATION_DATE_STORAGE_KEY,
      MOCK_API_RESPONSES_JSON[API_ENDPOINT_OBTAIN_TOKEN]
        .access_token_expiration_utc,
    );

    expect(mockDispatch).toHaveBeenCalledWith({ type: "LOGGED_IN" });
  });
});

it("displays right error message upon KO response", async () => {
  renderComponent();

  await fillInputsWithValidCredentials();

  fetchMock.mockOnceIf(
    endpoint,
    JSON.stringify({ errors: [{ code: ERROR_CODE_INVALID_EMAIL }] }),
    {
      status: 401,
    },
  );

  pressSubmit();

  await waitFor(() => {
    screen.getByText(enTranslations.LandingScreen.INVALID_EMAIL_LOGIN);
  });

  fetchMock.mockOnceIf(endpoint, "{}", {
    status: 401,
  });

  pressSubmit();
  await waitFor(() => {
    screen.getByText(enTranslations.LandingScreen.INVALID_PASSWORD_LOGIN);
  });

  fetchMock.mockOnceIf(endpoint, "{}", {
    status: 400,
  });

  pressSubmit();

  await waitFor(() => {
    screen.getByText(enTranslations.Common.UNFORESEEN_ERROR);
  });
});
