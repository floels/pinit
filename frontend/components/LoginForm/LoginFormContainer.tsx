import { useState } from "react";
import {
  ERROR_CODE_INVALID_PASSWORD,
  ERROR_CODE_INVALID_EMAIL,
  ERROR_CODE_FETCH_FAILED,
  API_ROUTE_OBTAIN_TOKEN,
  API_ROUTE_OBTAIN_DEMO_TOKEN,
} from "../../lib/constants";
import { isValidEmail, isValidPassword } from "../../lib/utils/validation";
import { setAccessTokenExpirationDate } from "@/lib/utils/authentication";
import LoginForm, { FormErrors } from "./LoginForm";

type LoginFormContainerProps = {
  handleClickNoAccountYet: () => void;
};

const computeFormErrors = (values: { email: string; password: string }) => {
  if (!values.email) {
    return { email: "MISSING_EMAIL" };
  }

  if (!isValidEmail(values.email)) {
    return { email: "INVALID_EMAIL_INPUT" };
  }

  if (!isValidPassword(values.password)) {
    return { password: "INVALID_PASSWORD_INPUT" };
  }

  return {};
};

const LoginFormContainer = ({
  handleClickNoAccountYet,
}: LoginFormContainerProps) => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    email: "MISSING_EMAIL",
  });
  const [showFormErrors, setShowFormErrors] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    const newCredentials = { ...credentials, [name]: value };

    setCredentials(newCredentials);

    setFormErrors(computeFormErrors(newCredentials));

    setShowFormErrors(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    fetchTokens();
  };

  const fetchTokens = async ({ isDemo }: { isDemo?: boolean } = {}) => {
    if (!isDemo) {
      setShowFormErrors(true);

      if (formErrors.email || formErrors.password) {
        // Invalid inputs: no need to make a request
        return;
      }
    }

    setIsLoading(true);

    let response;

    try {
      response = await fetchTokensAndThrow({ isDemo });
    } catch (error) {
      updateFormErrorsFromFetchError({ error: error as Error });
      return;
    } finally {
      setIsLoading(false);
    }

    let responseData;

    try {
      responseData = await response.json();
    } catch {
      // Fail silently
    }

    setAccessTokenExpirationDate(responseData.access_token_expiration_utc);

    window.location.reload();
  };

  const fetchTokensAndThrow = async ({
    isDemo,
  }: {
    isDemo: boolean | undefined;
  }) => {
    const requestBody = JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    });

    let response;

    try {
      if (isDemo) {
        response = await fetch(API_ROUTE_OBTAIN_DEMO_TOKEN);
      } else {
        response = await fetch(API_ROUTE_OBTAIN_TOKEN, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: requestBody,
        });
      }
    } catch {
      throw new Error(ERROR_CODE_FETCH_FAILED);
    }

    if (!response.ok) {
      const data = await response.json();

      if (data?.errors?.length > 0) {
        const firstErrorCode = data.errors[0]?.code;

        throw new Error(firstErrorCode);
      }

      throw new Error();
    }

    return response;
  };

  const updateFormErrorsFromFetchError = ({ error }: { error: Error }) => {
    const errorCode = error.message;

    switch (errorCode) {
      case ERROR_CODE_INVALID_EMAIL:
        setFormErrors({ email: "INVALID_EMAIL_LOGIN" });
        break;
      case ERROR_CODE_INVALID_PASSWORD:
        setFormErrors({ password: "INVALID_PASSWORD_LOGIN" });
        break;
      default:
        setFormErrors({ other: "UNFORESEEN_ERROR" });
    }
  };

  const handleClickLoginAsDemo = () => {
    fetchTokens({ isDemo: true });
  };

  return (
    <LoginForm
      credentials={credentials}
      formErrors={formErrors}
      showFormErrors={showFormErrors}
      isLoading={isLoading}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      handleClickLoginAsDemo={handleClickLoginAsDemo}
      handleClickNoAccountYet={handleClickNoAccountYet}
    />
  );
};

export default LoginFormContainer;
