import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, API_ENDPOINT_ACCOUNT_DETAILS } from "@/lib/constants";
import { throwIfKO } from "@/lib/utils/fetch";
import { serializeAccountWithPublicDetails } from "@/lib/utils/serializers";
import { Response404Error } from "@/lib/customErrors";
import AccountDetailsView from "@/components/AccountDetailsView/AccountDetailsView";
import ErrorView from "@/components/ErrorView/ErrorView";
import SpinnerBelowHeader from "@/components/Spinners/SpinnerBelowHeader";

const AccountPage = () => {
  const { username } = useParams<{ username: string }>();

  const fetchAccount = async () => {
    const response = await fetch(
      `${API_BASE_URL}/${API_ENDPOINT_ACCOUNT_DETAILS}/${username}/`,
    );

    if (response.status === 404) throw new Response404Error();

    throwIfKO(response);

    return serializeAccountWithPublicDetails(await response.json());
  };

  const { data: account, error, isLoading } = useQuery({
    queryKey: ["account", username],
    queryFn: fetchAccount,
    retry: (_, error) => !(error instanceof Response404Error),
  });

  if (isLoading) return <SpinnerBelowHeader />;

  if (error) {
    const errorMessageKey =
      error instanceof Response404Error
        ? "AccountDetails.ERROR_ACCOUNT_NOT_FOUND"
        : "AccountDetails.ERROR_FETCH_ACCOUNT_DETAILS";
    return <ErrorView errorMessageKey={errorMessageKey} />;
  }

  return <AccountDetailsView account={account!} />;
};

export default AccountPage;
