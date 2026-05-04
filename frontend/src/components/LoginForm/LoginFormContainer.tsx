import { useState } from "react";
import {
  ERROR_CODE_INVALID_PASSWORD,
  ERROR_CODE_INVALID_EMAIL,
  ERROR_CODE_FETCH_FAILED,
  API_URL_OBTAIN_TOKEN,
} from "../../lib/constants";
import { isValidEmail, isValidPassword } from "../../lib/utils/validation";
import { useAuthContext } from "@/contexts/authContext";
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
  const { setAccessToken } = useAuthContext();

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

  const fetchTokens = async () => {
    setShowFormErrors(true);

    if (formErrors.email || formErrors.password) {
      return;
    }

    setIsLoading(true);

    let loginData;

    try {
      loginData = await fetchTokensAndThrow();
    } catch (error) {
      updateFormErrorsFromFetchError({ error: error as Error });
      return;
    } finally {
      setIsLoading(false);
    }

    setAccessToken(loginData.access_token);
  };

  const fetchTokensAndThrow = async () => {
    const requestBody = JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    });

    let response;

    try {
      response = await fetch(API_URL_OBTAIN_TOKEN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: requestBody,
        credentials: "include",
      });
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

    return response.json();
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

  return (
    <LoginForm
      credentials={credentials}
      formErrors={formErrors}
      showFormErrors={showFormErrors}
      isLoading={isLoading}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      handleClickNoAccountYet={handleClickNoAccountYet}
    />
  );
};

export default LoginFormContainer;
