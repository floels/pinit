import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import "./src/lib/i18n";

import { AccountContextProvider } from "./src/contexts/accountContext";
import { AuthenticationContextProvider } from "./src/contexts/authenticationContext";

import NavigationContainer from "@/src/components/NavigationContainer/NavigationContainer";
import ToastAnchor from "@/src/components/ToastAnchor/ToastAnchor";

const App = () => {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <AuthenticationContextProvider>
          <AccountContextProvider>
            <NavigationContainer />
          </AccountContextProvider>
        </AuthenticationContextProvider>
      </QueryClientProvider>
      <ToastAnchor />
    </>
  );
};

export default App;
