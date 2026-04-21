import { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleXmark, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import LabelledTextInput from "../LabelledTextInput/LabelledTextInput";
import styles from "./LoginForm.module.css";

type Credentials = {
  email: string;
  password: string;
};

export type FormErrors = {
  email?: string;
  password?: string;
  other?: string;
};

type LoginFormProps = {
  credentials: Credentials;
  formErrors: FormErrors;
  showFormErrors: boolean;
  isLoading: boolean;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  handleClickLoginAsDemo: () => void;
  handleClickNoAccountYet: () => void;
};

const LoginForm = ({
  credentials,
  formErrors,
  showFormErrors,
  isLoading,
  handleInputChange,
  handleSubmit,
  handleClickLoginAsDemo,
  handleClickNoAccountYet,
}: LoginFormProps) => {
  const { t } = useTranslation(["LandingPageContent", "Common"]);

  const emailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    emailInputRef.current?.focus();
  }, []);

  let displayFormErrorsOther;

  if (formErrors.other) {
    displayFormErrorsOther = (
      <div className={styles.otherErrorMessage}>
        <FontAwesomeIcon icon={faCircleXmark} />
        <div className={styles.otherErrorText}>
          {t("Common:UNFORESEEN_ERROR")}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <img
        src="/images/logo.svg"
        alt="PinIt logo"
        width={40}
        height={40}
        className={styles.logo}
      />
      <h1 className={styles.title}>
        {t("LoginForm.WELCOME_TO_PINIT")}
      </h1>
      <form noValidate onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.emailInputContainer}>
          <LabelledTextInput
            name="email"
            label={t("LoginForm.EMAIL")}
            placeholder={t("LoginForm.EMAIL")}
            type="email"
            value={credentials.email}
            errorMessage={
              showFormErrors && formErrors.email
                ? t(`LoginForm.${formErrors.email}`)
                : ""
            }
            onChange={handleInputChange}
            autoComplete="email"
            ref={emailInputRef}
          />
        </div>
        <div className={styles.passwordInputContainer}>
          <LabelledTextInput
            name="password"
            label={t("LoginForm.PASSWORD")}
            placeholder={t("LoginForm.PASSWORD")}
            type="password"
            value={credentials.password}
            errorMessage={
              showFormErrors && formErrors.password
                ? t(`LoginForm.${formErrors.password}`)
                : ""
            }
            onChange={handleInputChange}
            withPasswordShowIcon
          />
        </div>
        {showFormErrors && displayFormErrorsOther}
        <button
          type="submit"
          className={styles.submitButton}
          data-testid="login-form-submit-button"
        >
          {t("LoginForm.LOG_IN")}
        </button>
      </form>
      <button className={styles.noAccountYet} onClick={handleClickNoAccountYet}>
        {t("LoginForm.NO_ACCOUNT_YET_CTA")}
      </button>
      <button onClick={handleClickLoginAsDemo} className={styles.loginAsDemo}>
        {t("LoginForm.LOG_IN_AS_DEMO")}
      </button>
      {isLoading && (
        <div
          className={styles.loadingOverlay}
          data-testid="login-form-loading-overlay"
        >
          <FontAwesomeIcon
            icon={faSpinner}
            size="2x"
            spin
            className={styles.loadingSpinner}
          />
        </div>
      )}
    </div>
  );
};

export default LoginForm;
