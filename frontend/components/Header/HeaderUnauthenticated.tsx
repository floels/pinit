import { useTranslation } from "react-i18next";
import OverlayModal from "../OverlayModal/OverlayModal";
import LoginFormContainer from "../LoginForm/LoginFormContainer";
import SignupFormContainer from "../SignupForm/SignupFormContainer";
import styles from "./HeaderUnauthenticated.module.css";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import HeaderSearchBarContainer from "./HeaderSearchBarContainer";

const HeaderUnauthenticated = () => {
  const { pathname } = useLocation();

  const isOnHomePage = pathname === "/" || pathname === "/en";

  const { t } = useTranslation("HeaderUnauthenticated");

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const openLogInModal = () => {
    setIsLoginModalOpen(true);
  };

  const openSignUpModal = () => {
    setIsSignupModalOpen(true);
  };

  const handleClickNoAccountYet = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleClickAlreadyHaveAccount = () => {
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleCloseSignupModal = () => {
    setIsSignupModalOpen(false);
  };

  return (
    <nav className={styles.container}>
      <a href="/" className={styles.logoContainer}>
        <img src="/images/logo.svg" alt="PinIt logo" width={32} height={32} />
        <h1 className={styles.logoHeader}>PinIt</h1>
      </a>
      {/* Trick: we render <HeaderSearchBar /> with a key containing the current pathname.
            This way, the component will be re-rendered on each route transition, and its value
            will be cleared. */}
      {!isOnHomePage && (
        <HeaderSearchBarContainer
          key={`header-search-bar-pathname-${pathname}`}
        />
      )}
      <div>
        <button
          className={styles.loginButton}
          onClick={openLogInModal}
          data-testid="header-log-in-button"
        >
          {t("LOG_IN")}
        </button>
        <button
          className={styles.signUpButton}
          onClick={openSignUpModal}
          data-testid="header-sign-up-button"
        >
          {t("SIGN_UP")}
        </button>
      </div>
      {isLoginModalOpen && (
        <OverlayModal onClose={handleCloseLoginModal}>
          <LoginFormContainer
            handleClickNoAccountYet={handleClickNoAccountYet}
          />
        </OverlayModal>
      )}
      {isSignupModalOpen && (
        <OverlayModal onClose={handleCloseSignupModal}>
          <SignupFormContainer
            handleClickAlreadyHaveAccount={handleClickAlreadyHaveAccount}
          />
        </OverlayModal>
      )}
    </nav>
  );
};

export default HeaderUnauthenticated;
