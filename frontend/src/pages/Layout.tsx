import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { useAuthContext } from "@/contexts/authContext";
import { HeaderSearchBarContextProvider } from "@/contexts/headerSearchBarContext";
import AuthenticatedSetupBuilder from "@/components/AuthenticatedSetupBuilder/AuthenticatedSetupBuilder";
import HeaderAuthenticatedContainer from "@/components/Header/HeaderAuthenticatedContainer";
import HeaderUnauthenticated from "@/components/Header/HeaderUnauthenticated";
import HeaderSearchBarFocusedOverlay from "@/components/Header/HeaderSearchBarFocusedOverlay";

const Layout = () => {
  const { accessToken } = useAuthContext();

  return (
    <>
      <ToastContainer position="bottom-left" autoClose={5000} />
      <HeaderSearchBarContextProvider>
        <AuthenticatedSetupBuilder />
        {accessToken ? (
          <HeaderAuthenticatedContainer />
        ) : (
          <HeaderUnauthenticated />
        )}
        <main>
          <Outlet />
          <HeaderSearchBarFocusedOverlay />
        </main>
      </HeaderSearchBarContextProvider>
    </>
  );
};

export default Layout;
