import { useState } from "react";
import {
  ERROR_CODE_INVALID_PASSWORD,
  ERROR_CODE_INVALID_EMAIL,
} from "../../lib/constants";
import { isValidEmail, isValidPassword } from "../../lib/utils/validation";
import { useLogin } from "@/lib/hooks/useLogin";
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
  const loginMutation = useLogin();

  const { sessionExpired } = useAuthContext();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    email: "MISSING_EMAIL",
  });
  const [showFormErrors, setShowFormErrors] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    const newCredentials = { ...credentials, [name]: value };

    setCredentials(newCredentials);

    setFormErrors(computeFormErrors(newCredentials));

    setShowFormErrors(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setShowFormErrors(true);

    if (formErrors.email || formErrors.password) {
      return;
    }

    loginMutation.mutate(credentials, {
      onError: (error) => updateFormErrorsFromFetchError({ error: error as Error }),
    });
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
      isLoading={loginMutation.isPending}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      handleClickNoAccountYet={handleClickNoAccountYet}
      showSessionExpiredMessage={sessionExpired}
    />
  );
};

export default LoginFormContainer;
