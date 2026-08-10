import { useTranslation } from "react-i18next";
import OverlayModal from "../OverlayModal/OverlayModal";
import LoginFormContainer from "../LoginForm/LoginFormContainer";
import SignupFormContainer from "../SignupForm/SignupFormContainer";
import styles from "./HeaderUnauthenticated.module.css";
import { useState } from "react";
import { useLocation } from "react-router";
import { useAuthenticationContext } from "@/contexts/authenticationContext";
import HeaderSearchBarContainer from "./HeaderSearchBarContainer";

const HeaderUnauthenticated = () => {
  const { pathname } = useLocation();

  const isOnHomePage = pathname === "/" || pathname === "/en";

  const { t } = useTranslation("HeaderUnauthenticated");

  const { isPromptingLogin, stopPromptingLogin } = useAuthenticationContext();

  // This component mounts at the moment 'Layout' swaps to the unauthenticated
  // shell, which is the moment a session ends. So the initial state is enough to
  // show the prompt, and no Effect is needed.
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(isPromptingLogin);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const openLogInModal = () => {
    setIsLoginModalOpen(true);
  };

  const openSignUpModal = () => {
    setIsSignupModalOpen(true);
  };

  // Leaving the login form is the user declining to log back in, whether they
  // close it or move on to signup. Both therefore stop the prompt, which lets
  // 'PinCreationToolPage' redirect home instead of holding a URL for a login
  // that is not coming.
  const handleClickNoAccountYet = () => {
    setIsLoginModalOpen(false);
    setIsSignupModalOpen(true);
    stopPromptingLogin();
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
    stopPromptingLogin();
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
