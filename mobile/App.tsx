import { QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import "./src/lib/i18n";

import { AccountContextProvider } from "./src/contexts/accountContext";
import { AuthenticationContextProvider } from "./src/contexts/authenticationContext";

import NavigationContainer from "@/src/components/NavigationContainer/NavigationContainer";
import ToastAnchor from "@/src/components/ToastAnchor/ToastAnchor";
import { queryClient } from "@/src/lib/queryClient";

const App = () => {
  return (
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthenticationContextProvider>
          <AccountContextProvider>
            <NavigationContainer />
          </AccountContextProvider>
        </AuthenticationContextProvider>
      </QueryClientProvider>
      <ToastAnchor />
    </StrictMode>
  );
};

export default App;
