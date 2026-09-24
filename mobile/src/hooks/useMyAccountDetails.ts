import AsyncStorage from "@react-native-async-storage/async-storage";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { useAuthenticationContext } from "@/src/contexts/authenticationContext";
import { useAPI } from "@/src/lib/api/useAPI";
import {
  API_BASE_URL,
  API_ENDPOINT_MY_ACCOUNT_DETAILS,
  PROFILE_PICTURE_URL_STORAGE_KEY,
} from "@/src/lib/constants";
import { throwIfKO } from "@/src/lib/utils/fetch";
import { serializeAccountWithPrivateDetails } from "@/src/lib/utils/serializers";

// Fetches the current user's account details once authenticated and caches the
// profile picture URL for cold-start tab icon. A dead session logs the user out
// inside 'useAPI'. Account data lives only in the React Query cache.
export const useMyAccountDetails = () => {
  const { state } = useAuthenticationContext();

  const { fetchAuthenticated } = useAPI();

  const fetchMyAccountDetails = async () => {
    const response = await fetchAuthenticated(
      `${API_BASE_URL}/${API_ENDPOINT_MY_ACCOUNT_DETAILS}`,
    );

    throwIfKO(response);

    const responseData = await response.json();

    return serializeAccountWithPrivateDetails(responseData);
  };

  const { data, error } = useQuery({
    queryKey: ["account", "me"],
    queryFn: fetchMyAccountDetails,
    enabled: state.isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (!data?.profilePictureURL) {
      return;
    }

    AsyncStorage.setItem(
      PROFILE_PICTURE_URL_STORAGE_KEY,
      data.profilePictureURL,
    );
  }, [data]);

  return { data, isError: !!error };
};
