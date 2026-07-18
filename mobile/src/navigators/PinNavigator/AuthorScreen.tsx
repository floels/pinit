import { NavigationProp, RouteProp } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { PinNavigatorParamList } from "./PinNavigator";

import AccountDetailsView from "@/src/components/AccountDetailsView/AccountDetailsView";
import {
  API_BASE_URL,
  API_ENDPOINT_ACCOUNT_DETAILS,
} from "@/src/lib/constants";
import { Account, AccountWithPublicDetails } from "@/src/lib/types";
import { throwIfKO } from "@/src/lib/utils/fetch";
import { serializeAccountWithPublicDetails } from "@/src/lib/utils/serializers";

type AuthorScreenProps = {
  route: RouteProp<PinNavigatorParamList, "Author">;
  navigation: NavigationProp<PinNavigatorParamList>;
};

const AuthorScreen = ({ route, navigation }: AuthorScreenProps) => {
  const providedAccount = route.params.author;

  const [account, setAccount] = useState<AccountWithPublicDetails | Account>(
    providedAccount,
  );

  const { username } = providedAccount;

  const fetchAccountDetails = async () => {
    const url = `${API_BASE_URL}/${API_ENDPOINT_ACCOUNT_DETAILS}/${username}/`;

    const response = await fetch(url);

    throwIfKO(response);

    const responseData = await response.json();

    return serializeAccountWithPublicDetails(responseData);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["queryAccountDetails", { username }],
    queryFn: fetchAccountDetails,
  });

  useEffect(() => {
    if (data) {
      setAccount(data);
    }
  }, [data]);

  return (
    <AccountDetailsView
      account={account}
      isLoading={isLoading}
      handlePressBack={navigation.goBack}
    />
  );
};

export default AuthorScreen;
