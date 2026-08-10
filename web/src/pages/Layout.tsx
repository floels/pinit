import { useEffect } from "react";
import { Outlet } from "react-router";
import { toast, ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/contexts/authContext";
import { useAccountContext } from "@/contexts/accountContext";
import { HeaderSearchBarContextProvider } from "@/contexts/headerSearchBarContext";
import HeaderAuthenticatedContainer from "@/components/Header/HeaderAuthenticatedContainer";
import HeaderUnauthenticated from "@/components/Header/HeaderUnauthenticated";
import HeaderSearchBarFocusedOverlay from "@/components/Header/HeaderSearchBarFocusedOverlay";
import SidebarAuthenticated from "@/components/Sidebar/SidebarAuthenticated";
import SpinnerBelowHeader from "@/components/Spinners/SpinnerBelowHeader";
import { USERNAME_LOCAL_STORAGE_KEY } from "@/lib/constants";
import styles from "./Layout.module.css";

const Layout = () => {
  const { t } = useTranslation();
  const { accessToken, isAuthInitialized } = useAuthContext();
  const { isFetchError: isAccountDetailsFetchError } = useAccountContext();

  // A reload destroys the in-memory access token, so the first render happens
  // before the startup refresh answers. A cached username means that this
  // browser held a session, so the app guesses "authenticated" and shows the
  // real header instead of a Log in button it must take back a moment later.
  // The guess lasts until the refresh settles. After that the token decides,
  // because the username outlives an expired cookie: only logout clears it.
  const hasCachedSession = !!localStorage.getItem(USERNAME_LOCAL_STORAGE_KEY);

  const looksAuthenticated =
    accessToken || (!isAuthInitialized && hasCachedSession);

  useEffect(() => {
    if (isAccountDetailsFetchError) {
      toast.warn(t("ACCOUNT_DETAILS_FETCH_ERROR"), {
        toastId: "toast-account-details-fetch-error",
      });
    }
  }, [isAccountDetailsFetchError]);

  return (
    <>
      <ToastContainer position="bottom-left" autoClose={5000} />
      <HeaderSearchBarContextProvider>
        {looksAuthenticated ? (
          <>
            <SidebarAuthenticated />
            <div className={styles.authenticatedContentArea}>
              <HeaderSearchBarFocusedOverlay />
              <HeaderAuthenticatedContainer />
              <main>
                {isAuthInitialized ? <Outlet /> : <SpinnerBelowHeader />}
              </main>
            </div>
          </>
        ) : (
          <>
            <HeaderUnauthenticated />
            <main>
              {isAuthInitialized ? <Outlet /> : <SpinnerBelowHeader />}
            </main>
          </>
        )}
      </HeaderSearchBarContextProvider>
    </>
  );
};

export default Layout;
