import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useAuthContext } from "@/contexts/authContext";
import { useAccountDetails } from "@/lib/hooks/useAccountDetails";
import { HeaderSearchBarContextProvider } from "@/contexts/headerSearchBarContext";
import HeaderAuthenticatedContainer from "@/components/Header/HeaderAuthenticatedContainer";
import HeaderUnauthenticated from "@/components/Header/HeaderUnauthenticated";
import HeaderSearchBarFocusedOverlay from "@/components/Header/HeaderSearchBarFocusedOverlay";
import SidebarAuthenticated from "@/components/Sidebar/SidebarAuthenticated";
import SpinnerBelowHeader from "@/components/Spinners/SpinnerBelowHeader";
import styles from "./Layout.module.css";

const Layout = () => {
  const { t } = useTranslation();
  const { accessToken, isAuthInitialized } = useAuthContext();
  const { isError: isAccountDetailsFetchError } = useAccountDetails();

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
        {accessToken ? (
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
