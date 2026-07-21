import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { useAccountContext } from "@/src/contexts/accountContext";
import { useAuthenticationContext } from "@/src/contexts/authenticationContext";
import {
  API_BASE_URL,
  API_ENDPOINT_MY_ACCOUNT_DETAILS,
  PROFILE_PICTURE_URL_STORAGE_KEY,
} from "@/src/lib/constants";
import { Response401Error } from "@/src/lib/customErrors";
import { clearStoredAuthData } from "@/src/lib/utils/authentication";
import { fetchWithAuthentication, throwIfKO } from "@/src/lib/utils/fetch";
import { serializeAccountWithPrivateDetails } from "@/src/lib/utils/serializers";

const fetchMyAccountDetails = async () => {
  const response = await fetchWithAuthentication(
    `${API_BASE_URL}/${API_ENDPOINT_MY_ACCOUNT_DETAILS}`,
  );

  if (response.status === 401) {
    throw new Response401Error();
  }

  throwIfKO(response);

  const responseData = await response.json();

  return serializeAccountWithPrivateDetails(responseData);
};

// Fetches the current user's account details once authenticated, mirrors them
// into the account context, and caches the profile picture. On a 401 it clears
// the stored session and logs the user out.
export const useMyAccountDetails = () => {
  const { state, dispatch } = useAuthenticationContext();
  const { setAccount } = useAccountContext();

  const { data, error } = useQuery({
    queryKey: ["myAccountDetails"],
    queryFn: fetchMyAccountDetails,
    enabled: state.isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (!data) {
      return;
    }

    setAccount(data);

    if (data.profilePictureURL) {
      AsyncStorage.setItem(
        PROFILE_PICTURE_URL_STORAGE_KEY,
        data.profilePictureURL,
      );
    }
  }, [data]);

  useEffect(() => {
    if (!(error instanceof Response401Error)) {
      return;
    }

    const logOut = async () => {
      await clearStoredAuthData();
      dispatch({ type: "GOT_401_RESPONSE" });
    };

    logOut();
  }, [error]);

  return { isError: !!error };
};
