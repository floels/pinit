import { useState, useEffect, RefObject } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleUp } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import styles from "./FifthFold.module.css";
import SignupFormContainer from "../SignupForm/SignupFormContainer";
import LoginFormContainer from "../LoginForm/LoginFormContainer";
import FifthFoldPicturesBackground from "./FifthFoldPicturesBackground";

type FifthFoldProps = {
  heroRef: RefObject<HTMLDivElement>;
  onClickBackToTop: () => void;
};

const FifthFold = ({ heroRef, onClickBackToTop }: FifthFoldProps) => {
  const { t } = useTranslation("LandingPageContent");

  const [showLoginInsteadOfSignup, setShowLoginInsteadOfSignup] =
    useState(false);

  const handleClickAlreadyHaveAccount = () => {
    setShowLoginInsteadOfSignup(true);
  };

  const handleClickNoAccountYet = () => {
    setShowLoginInsteadOfSignup(false);
  };

  // This is needed to scroll back to the top of the page.
  // Otherwise, for some reason, browsers scroll down to the first input of the
  // <SignupForm /> rendered below on page load.
  useEffect(() => {
    if (heroRef.current?.scrollIntoView) {
      heroRef.current.scrollIntoView();
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <FifthFoldPicturesBackground />
        <div className={styles.overlay}>
          <div className={styles.textArea}>
            <h1 className={styles.header}>{t("FifthFold.SIGNUP_HEADER")}</h1>
          </div>
          <div className={styles.formArea}>
            <div className={styles.formContainer}>
              {!showLoginInsteadOfSignup && (
                <SignupFormContainer
                  handleClickAlreadyHaveAccount={handleClickAlreadyHaveAccount}
                />
              )}
              {showLoginInsteadOfSignup && (
                <LoginFormContainer
                  handleClickNoAccountYet={handleClickNoAccountYet}
                />
              )}
            </div>
          </div>
        </div>
        <button
          className={styles.backToTopButton}
          onClick={onClickBackToTop}
          data-testid="back-to-top-button"
        >
          <FontAwesomeIcon
            icon={faAngleUp}
            className={styles.backToTopButtonIcon}
            size="2x"
          />
        </button>
      </div>
      <footer className={styles.footer}>
        <a href="#" className={styles.footerLink}>
          {t("FifthFold.TERMS_OF_SERVICE")}
        </a>
        <a href="#" className={styles.footerLink}>
          {t("FifthFold.PRIVACY_POLICY")}
        </a>
        <a href="#" className={styles.footerLink}>
          {t("FifthFold.HELP")}
        </a>
      </footer>
    </div>
  );
};

export default FifthFold;
