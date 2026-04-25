import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAuthContext } from "@/contexts/authContext";
import { HeaderSearchBarContextProvider } from "@/contexts/headerSearchBarContext";
import AuthBootstrap from "@/components/AuthBootstrap/AuthBootstrap";
import HeaderAuthenticatedContainer from "@/components/Header/HeaderAuthenticatedContainer";
import HeaderUnauthenticated from "@/components/Header/HeaderUnauthenticated";
import HeaderSearchBarFocusedOverlay from "@/components/Header/HeaderSearchBarFocusedOverlay";
import SpinnerBelowHeader from "@/components/Spinners/SpinnerBelowHeader";

const Layout = () => {
  const { accessToken, isAuthInitialized } = useAuthContext();

  return (
    <>
      <ToastContainer position="bottom-left" autoClose={5000} />
      <HeaderSearchBarContextProvider>
        <AuthBootstrap />
        {accessToken ? (
          <HeaderAuthenticatedContainer />
        ) : (
          <HeaderUnauthenticated />
        )}
        <main>
          {isAuthInitialized ? <Outlet /> : <SpinnerBelowHeader />}
          <HeaderSearchBarFocusedOverlay />
        </main>
      </HeaderSearchBarContextProvider>
    </>
  );
};

export default Layout;
