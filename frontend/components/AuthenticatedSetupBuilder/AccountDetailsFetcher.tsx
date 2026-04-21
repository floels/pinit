import { useAccountContext } from "@/contexts/accountContext";
import {
  API_ROUTE_MY_ACCOUNT_DETAILS,
  PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY,
  USERNAME_LOCAL_STORAGE_KEY,
} from "@/lib/constants";
import { Response401Error } from "@/lib/customErrors";
import { useLogOut } from "@/lib/hooks/useLogOut";
import { AccountWithPrivateDetails } from "@/lib/types/frontendTypes";
import { throwIfKO } from "@/lib/utils/fetch";
import { serializeAccountWithPrivateDetails } from "@/lib/utils/serializers";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

const AccountDetailsFetcher = () => {
  const logOut = useLogOut();

  const { setAccount } = useAccountContext();

  const fetchAccountDetails = async () => {
    const response = await fetch(API_ROUTE_MY_ACCOUNT_DETAILS);

    if (response.status === 401) {
      throw new Response401Error();
    }

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

  const { data, error } = useQuery({
    queryKey: ["fetchMyAccountDetails"],
    queryFn: fetchAccountDetails,
    retry: false,
  });

  useEffect(() => {
    if (error instanceof Response401Error) {
      logOut();
    }
  }, [error]);

  useEffect(() => {
    if (data) {
      setAccount(data);
      persistAccountData(data);
    }
  }, [data]);

  return null;
};

export default AccountDetailsFetcher;
