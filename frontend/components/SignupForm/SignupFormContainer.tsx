import { useState } from "react";
import {
  API_ROUTE_SIGN_UP,
  ERROR_CODE_EMAIL_ALREADY_SIGNED_UP,
  ERROR_CODE_FETCH_FAILED,
  ERROR_CODE_INVALID_BIRTHDATE,
  ERROR_CODE_INVALID_EMAIL,
  ERROR_CODE_INVALID_PASSWORD,
} from "../../lib/constants";
import {
  isValidBirthdate,
  isValidEmail,
  isValidPassword,
} from "../../lib/utils/validation";
import SignupForm, { FormErrors } from "./SignupForm";
import { ResponseKOError } from "@/lib/customErrors";
import { setAccessTokenExpirationDate } from "@/lib/utils/authentication";

type SignupFormContainerProps = {
  handleClickAlreadyHaveAccount: () => void;
};

const computeFormErrors = (values: {
  email: string;
  password: string;
  birthdate: string;
}) => {
  if (!values.email) {
    return { email: "MISSING_EMAIL" };
  }

  if (!isValidEmail(values.email)) {
    return { email: "INVALID_EMAIL_INPUT" };
  }

  if (!isValidPassword(values.password)) {
    return { password: "INVALID_PASSWORD_INPUT" };
  }

  if (!isValidBirthdate(values.birthdate)) {
    return { birthdate: "INVALID_BIRTHDATE_INPUT" };
  }

  return {};
};

const SignupFormContainer = ({
  handleClickAlreadyHaveAccount,
}: SignupFormContainerProps) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    birthdate: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    email: "MISSING_EMAIL",
  });
  const [showFormErrors, setShowFormErrors] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    const newFormData = { ...formData, [name]: value };

    setFormData(newFormData);

    setFormErrors(computeFormErrors(newFormData));

    setShowFormErrors(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setShowFormErrors(true);

    if (formErrors.email || formErrors.password || formErrors.birthdate) {
      // Invalid inputs: no need to make a request
      return;
    }

    setIsLoading(true);

    let response;

    try {
      response = await fetchSignup();
    } catch (error) {
      const errorCode = (error as Error).message;
      updateFormErrorsFromErrorCode(errorCode);
      return;
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

  const fetchSignup = async () => {
    const requestBody = JSON.stringify(formData);

    let response;

    try {
      response = await fetch(API_ROUTE_SIGN_UP, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: requestBody,
      });
    } catch {
      throw new Error(ERROR_CODE_FETCH_FAILED);
    } finally {
      setIsLoading(false);
    }

    if (!response.ok) {
      const data = await response.json();

      if (data?.errors?.length > 0) {
        const firstErrorCode = data.errors[0]?.code;

        throw new ResponseKOError(firstErrorCode);
      }

      throw new ResponseKOError();
    }

    return response;
  };

  const updateFormErrorsFromErrorCode = (errorCode: string) => {
    switch (errorCode) {
      case ERROR_CODE_INVALID_EMAIL:
        setFormErrors({ email: "INVALID_EMAIL_SIGNUP" });
        break;
      case ERROR_CODE_INVALID_PASSWORD:
        setFormErrors({ password: "INVALID_PASSWORD_SIGNUP" });
        break;
      case ERROR_CODE_INVALID_BIRTHDATE:
        setFormErrors({ birthdate: "INVALID_BIRTHDATE_SIGNUP" });
        break;
      case ERROR_CODE_EMAIL_ALREADY_SIGNED_UP:
        setFormErrors({ other: "EMAIL_ALREADY_SIGNED_UP" });
        break;
      default:
        setFormErrors({ other: "UNFORESEEN_ERROR" });
    }
  };

  return (
    <SignupForm
      formErrors={formErrors}
      formData={formData}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      isLoading={isLoading}
      handleClickAlreadyHaveAccount={handleClickAlreadyHaveAccount}
      showFormErrors={showFormErrors}
    />
  );
};

export default SignupFormContainer;
