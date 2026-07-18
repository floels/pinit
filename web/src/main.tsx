import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./i18n";
import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";
import "@fortawesome/fontawesome-svg-core/styles.css";
import { config } from "@fortawesome/fontawesome-svg-core";
config.autoAddCss = false;
import { AuthContextProvider } from "@/contexts/authContext";
import { AccountContextProvider } from "@/contexts/accountContext";
import QueryClientProvider from "@/components/QueryClientProvider/QueryClientProvider";
import ErrorBoundary from "@/components/ErrorBoundary/ErrorBoundary";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider>
        <AuthContextProvider>
          <AccountContextProvider>
            <RouterProvider router={router} />
          </AccountContextProvider>
        </AuthContextProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
