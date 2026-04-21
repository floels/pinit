import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import "./i18n";
import { AuthContextProvider } from "@/contexts/authContext";
import { AccountContextProvider } from "@/contexts/accountContext";
import QueryClientProvider from "@/components/QueryClientProvider/QueryClientProvider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider>
      <AuthContextProvider>
        <AccountContextProvider>
          <RouterProvider router={router} />
        </AccountContextProvider>
      </AuthContextProvider>
    </QueryClientProvider>
  </StrictMode>,
);
