import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAuthContext } from "@/contexts/authContext";
import { HeaderSearchBarContextProvider } from "@/contexts/headerSearchBarContext";
import AuthBootstrap from "@/components/AuthBootstrap/AuthBootstrap";
import HeaderAuthenticatedContainer from "@/components/Header/HeaderAuthenticatedContainer";
import HeaderUnauthenticated from "@/components/Header/HeaderUnauthenticated";
import HeaderSearchBarFocusedOverlay from "@/components/Header/HeaderSearchBarFocusedOverlay";
import SidebarAuthenticated from "@/components/Sidebar/SidebarAuthenticated";
import SpinnerBelowHeader from "@/components/Spinners/SpinnerBelowHeader";
import styles from "./Layout.module.css";

const Layout = () => {
  const { accessToken, isAuthInitialized } = useAuthContext();

  return (
    <>
      <ToastContainer position="bottom-left" autoClose={5000} />
      <HeaderSearchBarContextProvider>
        <AuthBootstrap />
        {accessToken ? (
          <>
            <SidebarAuthenticated />
            <div className={styles.authenticatedContentArea}>
              <HeaderAuthenticatedContainer />
              <main>
                {isAuthInitialized ? <Outlet /> : <SpinnerBelowHeader />}
                <HeaderSearchBarFocusedOverlay />
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
