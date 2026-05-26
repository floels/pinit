import { useState } from "react";
import {
  ERROR_CODE_EMAIL_ALREADY_SIGNED_UP,
  ERROR_CODE_INVALID_BIRTHDATE,
  ERROR_CODE_INVALID_EMAIL,
  ERROR_CODE_INVALID_PASSWORD,
} from "../../lib/constants";
import {
  isValidBirthdate,
  isValidEmail,
  isValidPassword,
} from "../../lib/utils/validation";
import { useSignup } from "@/lib/hooks/useSignup";
import SignupForm, { FormErrors } from "./SignupForm";

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
  const signupMutation = useSignup();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    birthdate: "",
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({
    email: "MISSING_EMAIL",
  });
  const [showFormErrors, setShowFormErrors] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    const newFormData = { ...formData, [name]: value };

    setFormData(newFormData);

    setFormErrors(computeFormErrors(newFormData));

    setShowFormErrors(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setShowFormErrors(true);

    if (formErrors.email || formErrors.password || formErrors.birthdate) {
      return;
    }

    signupMutation.mutate(formData, {
      onError: (error) => {
        const errorCode = (error as Error).message;
        updateFormErrorsFromErrorCode(errorCode);
      },
    });
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
      isLoading={signupMutation.isPending}
      handleClickAlreadyHaveAccount={handleClickAlreadyHaveAccount}
      showFormErrors={showFormErrors}
    />
  );
};

export default SignupFormContainer;
