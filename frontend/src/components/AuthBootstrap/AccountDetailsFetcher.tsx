import { useAuthContext } from "@/contexts/authContext";
import { useAccountContext } from "@/contexts/accountContext";
import {
  API_URL_MY_ACCOUNT_DETAILS,
  PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY,
  USERNAME_LOCAL_STORAGE_KEY,
} from "@/lib/constants";
import { useFetchWithAuth } from "@/lib/hooks/useFetchWithAuth";
import { AccountWithPrivateDetails } from "@/lib/types/frontendTypes";
import { throwIfKO } from "@/lib/utils/fetch";
import { serializeAccountWithPrivateDetails } from "@/lib/utils/serializers";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const AccountDetailsFetcher = () => {
  const fetchWithAuth = useFetchWithAuth();
  const { setAccount } = useAccountContext();
  const { accessToken } = useAuthContext();

  const fetchAccountDetails = async () => {
    const response = await fetchWithAuth(API_URL_MY_ACCOUNT_DETAILS);

    throwIfKO(response);

    const responseData = await response.json();

    return serializeAccountWithPrivateDetails(responseData);
  };

  const persistAccountData = (data: AccountWithPrivateDetails) => {
    const { username, profilePictureURL } = data;

    persistUsername(username);

    if (profilePictureURL) {
      persistProfilePictureURL(profilePictureURL);
    }
  };

  const persistUsername = (username: string) => {
    localStorage?.setItem(USERNAME_LOCAL_STORAGE_KEY, username);
  };

  const persistProfilePictureURL = (profilePictureUrl: string) => {
    localStorage?.setItem(
      PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY,
      profilePictureUrl,
    );
  };

  const { data } = useQuery({
    queryKey: ["fetchMyAccountDetails", accessToken],
    queryFn: fetchAccountDetails,
    retry: false,
  });

  useEffect(() => {
    if (data) {
      setAccount(data);
      persistAccountData(data);
    }
  }, [data]);

  return null;
};

export default AccountDetailsFetcher;
