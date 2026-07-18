import { useQuery } from "@tanstack/react-query";

import { throwIfKO } from "../lib/utils/fetch";

import {
  API_BASE_URL,
  API_ENDPOINT_ACCOUNT_DETAILS,
} from "@/src/lib/constants";
import { serializeAccountWithPublicDetails } from "@/src/lib/utils/serializers";

const fetchAccountDetails = async ({ username }: { username: string }) => {
  const response = await fetch(
    `${API_BASE_URL}/${API_ENDPOINT_ACCOUNT_DETAILS}/${username}/`,
  );

  throwIfKO(response);

  const responseData = await response.json();

  return serializeAccountWithPublicDetails(responseData);
};

export const useAccountDetailsQuery = ({ username }: { username: string }) => {
  const query = useQuery({
    queryKey: ["accountDetails", username],
    queryFn: () => fetchAccountDetails({ username }),
  });

  // We select only the relevant attribute of the query,
  // because some attribute of a 'UseQueryResult' are not
  // serializable, which triggers a warning from React Navigation when
  // we pass the object to 'navigation.navigate()':
  return {
    data: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
  };
};
