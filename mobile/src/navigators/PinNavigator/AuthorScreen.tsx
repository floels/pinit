import { NavigationProp, RouteProp } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";

import { PinNavigatorParamList } from "./PinNavigator";

import AccountDetailsView from "@/src/components/AccountDetailsView/AccountDetailsView";
import { fetchPublic } from "@/src/lib/api/fetchers";
import {
  API_BASE_URL,
  API_ENDPOINT_ACCOUNT_DETAILS,
} from "@/src/lib/constants";
import { throwIfKO } from "@/src/lib/utils/fetch";
import { serializeAccountWithPublicDetails } from "@/src/lib/utils/serializers";

type AuthorScreenProps = {
  route: RouteProp<PinNavigatorParamList, "Author">;
  navigation: NavigationProp<PinNavigatorParamList>;
};

const AuthorScreen = ({ route, navigation }: AuthorScreenProps) => {
  const providedAccount = route.params.author;

  const { username } = providedAccount;

  const fetchAccountDetails = async () => {
    const url = `${API_BASE_URL}/${API_ENDPOINT_ACCOUNT_DETAILS}/${username}/`;

    const response = await fetchPublic(url);

    throwIfKO(response);

    const responseData = await response.json();

    return serializeAccountWithPublicDetails(responseData);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["queryAccountDetails", { username }],
    queryFn: fetchAccountDetails,
  });

  // The query starts from the account the previous screen already handed us,
  // and upgrades to the public details once they arrive.
  const account = data ?? providedAccount;

  return (
    <AccountDetailsView
      account={account}
      isLoading={isLoading}
      handlePressBack={navigation.goBack}
    />
  );
};

export default AuthorScreen;
