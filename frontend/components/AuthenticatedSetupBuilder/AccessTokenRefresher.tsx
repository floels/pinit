"use client";

import { useEffect } from "react";
import {
  API_ROUTE_REFRESH_TOKEN,
  ACCESS_TOKEN_EXPIRATION_DATE_LOCAL_STORAGE_KEY,
} from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { setAccessTokenExpirationDate } from "@/lib/utils/authentication";

type AccessTokenRefresherProps = {
  handleFinishedFetching: () => void;
};

export const TOKEN_REFRESH_BUFFER_BEFORE_EXPIRATION = 60 * 60 * 1000; // i.e. 1 hour

const AccessTokenRefresher = ({
  handleFinishedFetching,
}: AccessTokenRefresherProps) => {
  const fetchRefreshedAccessTokenIfNecessary = async () => {
    const shouldRefreshAccessToken = checkShouldRefreshAccessToken();

    if (!shouldRefreshAccessToken) {
      handleFinishedFetching();
      return {}; // necessary to return empty object,
      // since we'll use this function as the 'queryFn' of a React Query.
    }

    const data = await fetchRefreshedAccessToken();

    return data;
  };

  const checkShouldRefreshAccessToken = () => {
    if (typeof window === "undefined" || !window.localStorage) {
      return true;
    }

    const accessTokenExpirationDateString = localStorage.getItem(
      ACCESS_TOKEN_EXPIRATION_DATE_LOCAL_STORAGE_KEY,
    );

    if (!accessTokenExpirationDateString) {
      return true;
    }

    const accessTokenExpirationDateTime = new Date(
      accessTokenExpirationDateString,
    ).getTime();

    const isInvalidDate = isNaN(accessTokenExpirationDateTime);

    if (isInvalidDate) {
      return true;
    }

    const nowTime = new Date().getTime();

    return (
      nowTime + TOKEN_REFRESH_BUFFER_BEFORE_EXPIRATION >
      accessTokenExpirationDateTime
    );
  };

  const fetchRefreshedAccessToken = async () => {
    const response = await fetch(API_ROUTE_REFRESH_TOKEN, {
      method: "POST",
    });

    return response.json();
  };

  const { data, status } = useQuery({
    queryKey: ["fetchRefreshedAccessToken"],
    queryFn: fetchRefreshedAccessTokenIfNecessary,
    retry: false,
  });

  useEffect(() => {
    if (status === "success" || status === "error") {
      handleFinishedFetching();
    }
  }, [status]);

  // Save refreshed access token expiration date to local storage:
  useEffect(() => {
    const accessTokenExpirationDate = data?.access_token_expiration_utc;

    if (accessTokenExpirationDate) {
      setAccessTokenExpirationDate(accessTokenExpirationDate);
    }
  }, [data]);

  return null;
};

export default AccessTokenRefresher;
