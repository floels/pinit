import { useState } from "react";
import { useAuthContext } from "@/contexts/authContext";
import AccessTokenRefresher from "./AccessTokenRefresher";
import AccountDetailsFetcher from "./AccountDetailsFetcher";

const AuthenticatedSetupBuilder = () => {
  const [isFetchingRefreshedToken, setIsFetchingRefreshedToken] =
    useState(true);
  const { accessToken } = useAuthContext();

  if (isFetchingRefreshedToken) {
    return (
      <AccessTokenRefresher
        handleFinishedFetching={() => setIsFetchingRefreshedToken(false)}
      />
    );
  }

  if (!accessToken) {
    return null;
  }

  return <AccountDetailsFetcher />;
};

export default AuthenticatedSetupBuilder;
