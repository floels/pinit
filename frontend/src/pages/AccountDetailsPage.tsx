import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, API_ENDPOINT_ACCOUNT_DETAILS } from "@/lib/constants";
import { throwIfKO } from "@/lib/utils/fetch";
import { serializeAccountWithPublicDetails } from "@/lib/utils/serializers";
import { Response404Error } from "@/lib/customErrors";
import AccountDetailsView from "@/components/AccountDetailsView/AccountDetailsView";
import ErrorView from "@/components/ErrorView/ErrorView";
import SpinnerBelowHeader from "@/components/Spinners/SpinnerBelowHeader";

const AccountDetailsPage = () => {
  const { username } = useParams<{ username: string }>();

  const fetchAccountDetails = async () => {
    const url = `${API_BASE_URL}/${API_ENDPOINT_ACCOUNT_DETAILS}/${username}/`;

    const response = await fetch(url);

    if (response.status === 404) {
      throw new Response404Error();
    }

    throwIfKO(response);

    const responseData = await response.json();

    return serializeAccountWithPublicDetails(responseData);
  };

  const { data: accountDetails, error, isLoading } = useQuery({
    queryKey: ["account", username],
    queryFn: fetchAccountDetails,
  });

  if (isLoading) {
    return <SpinnerBelowHeader />;
  }

  if (error) {
    const errorMessageKey =
      error instanceof Response404Error
        ? "AccountDetails.ERROR_ACCOUNT_NOT_FOUND"
        : "AccountDetails.ERROR_FETCH_ACCOUNT_DETAILS";
    
        return <ErrorView errorMessageKey={errorMessageKey} />;
  }

  return <AccountDetailsView account={accountDetails!} />;
};

export default AccountDetailsPage;
