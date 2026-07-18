import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";

import { useAccountContext } from "@/src/contexts/accountContext";
import { useAuthenticationContext } from "@/src/contexts/authenticationContext";
import {
  API_BASE_URL,
  API_ENDPOINT_MY_ACCOUNT_DETAILS,
  PROFILE_PICTURE_URL_STORAGE_KEY,
} from "@/src/lib/constants";
import { Response401Error } from "@/src/lib/customErrors";
import { fetchWithAuthentication, throwIfKO } from "@/src/lib/utils/fetch";
import { serializeAccountWithPrivateDetails } from "@/src/lib/utils/serializers";

const AccountDetailsFetcher = () => {
  const authenticationContext = useAuthenticationContext();
  const { setAccount } = useAccountContext();

  const fetchDispatchAndPersist = async () => {
    let accountDetails;

    try {
      accountDetails = await fetchAccountDetails();
    } catch (error) {
      if (error instanceof Response401Error) {
        authenticationContext.dispatch({ type: "GOT_401_RESPONSE" });
        return;
      }

      // For other errors, fail silently:
      return;
    }

    setAccount(accountDetails);

    await persistProfilePictureURL({
      profilePictureURL: accountDetails.profilePictureURL,
    });
  };

  const fetchAccountDetails = async () => {
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

  const persistProfilePictureURL = async ({
    profilePictureURL,
  }: {
    profilePictureURL: string | null;
  }) => {
    if (profilePictureURL) {
      await AsyncStorage.setItem(
        PROFILE_PICTURE_URL_STORAGE_KEY,
        profilePictureURL,
      );
    }
  };

  useEffect(() => {
    fetchDispatchAndPersist();
  }, []);

  return null;
};

export default AccountDetailsFetcher;
