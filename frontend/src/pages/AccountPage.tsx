import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL, API_ENDPOINT_ACCOUNT_DETAILS } from "@/lib/constants";
import { throwIfKO } from "@/lib/utils/fetch";
import { serializeAccountWithPublicDetails } from "@/lib/utils/serializers";
import { Response404Error } from "@/lib/customErrors";
import { AccountWithPublicDetails } from "@/lib/types/frontendTypes";
import AccountDetailsView from "@/components/AccountDetailsView/AccountDetailsView";
import ErrorView from "@/components/ErrorView/ErrorView";
import SpinnerBelowHeader from "@/components/Spinners/SpinnerBelowHeader";

const AccountPage = () => {
  const { username } = useParams<{ username: string }>();
  const [account, setAccount] = useState<AccountWithPublicDetails | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/${API_ENDPOINT_ACCOUNT_DETAILS}/${username}/`,
        );

        if (response.status === 404) throw new Response404Error();

        throwIfKO(response);

        const data = await response.json();
        setAccount(serializeAccountWithPublicDetails(data));
      } catch (err) {
        setError(err as Error);
      }
    };

    fetchAccount();
  }, [username]);

  if (error) {
    const errorMessageKey =
      error instanceof Response404Error
        ? "AccountDetails.ERROR_ACCOUNT_NOT_FOUND"
        : "AccountDetails.ERROR_FETCH_ACCOUNT_DETAILS";
    return <ErrorView errorMessageKey={errorMessageKey} />;
  }

  if (!account) {
    return <SpinnerBelowHeader />;
  }

  return <AccountDetailsView account={account} />;
};

export default AccountPage;
