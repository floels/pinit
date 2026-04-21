"use client";

import { useState } from "react";

import AccessTokenRefresher from "./AccessTokenRefresher";
import AccountDetailsFetcher from "./AccountDetailsFetcher";

const AuthenticatedSetupBuilder = () => {
  const [isFetchingRefreshedToken, setIsFetchingRefreshedToken] =
    useState(true);

  const handleFinishedFetchingRefreshToken = () => {
    setIsFetchingRefreshedToken(false);
  };

  if (isFetchingRefreshedToken) {
    return (
      <AccessTokenRefresher
        handleFinishedFetching={handleFinishedFetchingRefreshToken}
      />
    );
  }

  return <AccountDetailsFetcher />;
};

export default AuthenticatedSetupBuilder;
