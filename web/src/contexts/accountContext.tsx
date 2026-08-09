import { createContext, useContext } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  API_URL_MY_ACCOUNT_DETAILS,
  PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY,
  USERNAME_LOCAL_STORAGE_KEY,
} from "@/lib/constants";
import { useAuthContext } from "@/contexts/authContext";
import { useFetchWithAuth } from "@/lib/hooks/useFetchWithAuth";
import { AccountWithPrivateDetails } from "@/lib/types/frontendTypes";
import { throwIfKO } from "@/lib/utils/fetch";
import { serializeAccountWithPrivateDetails } from "@/lib/utils/serializers";

export type AccountContextType = {
  account: AccountWithPrivateDetails | null;
  setAccount: (account: AccountWithPrivateDetails) => void;
  isFetchError: boolean;
};

export const AccountContext = createContext<AccountContextType>({
  account: null,
  setAccount: () => {},
  isFetchError: false,
});

const getQueryKey = (accessToken: string | null) => [
  "fetchMyAccountDetails",
  accessToken,
];

const persistAccountData = ({
  username,
  profilePictureURL,
}: AccountWithPrivateDetails) => {
  localStorage?.setItem(USERNAME_LOCAL_STORAGE_KEY, username);

  if (profilePictureURL) {
    localStorage?.setItem(
      PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY,
      profilePictureURL,
    );
  }
};

export const AccountContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const queryClient = useQueryClient();
  const fetchWithAuth = useFetchWithAuth();
  const { accessToken, isAuthInitialized } = useAuthContext();

  const queryKey = getQueryKey(accessToken);

  const fetchAccountDetails = async () => {
    const response = await fetchWithAuth(API_URL_MY_ACCOUNT_DETAILS);

    throwIfKO(response);

    const responseData = await response.json();

    const account = serializeAccountWithPrivateDetails(responseData);

    persistAccountData(account);

    return account;
  };

  const { data, isError } = useQuery({
    queryKey,
    queryFn: fetchAccountDetails,
    enabled: isAuthInitialized && !!accessToken,
    retry: false,
  });

  // The query cache holds the account, so a local update writes to the cache
  // instead of to a second store. A later refetch then overwrites it with the
  // server state, rather than fighting it.
  const setAccount = (account: AccountWithPrivateDetails) => {
    queryClient.setQueryData(queryKey, account);
  };

  const contextValue = {
    account: data ?? null,
    setAccount,
    isFetchError: isError,
  };

  return (
    <AccountContext.Provider value={contextValue}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccountContext = () => useContext(AccountContext);
