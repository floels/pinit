import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { API_URL_ACCOUNT_DETAILS } from "@/lib/constants";
import { throwIfKO } from "@/lib/utils/fetch";
import { serializeAccountWithPublicDetails } from "@/lib/utils/serializers";
import { Response404Error } from "@/lib/customErrors";
import AccountDetailsView from "@/components/AccountDetails/AccountDetails";
import ErrorView from "@/components/ErrorView/ErrorView";
import SpinnerBelowHeader from "@/components/Spinners/SpinnerBelowHeader";

const AccountDetailsPage = () => {
  const { t } = useTranslation("AccountDetails");
  const { username } = useParams<{ username: string }>();

  const fetchAccountDetails = async () => {
    const url = `${API_URL_ACCOUNT_DETAILS}/${username}/`;

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
    const errorMessage =
      error instanceof Response404Error
        ? t("ERROR_ACCOUNT_NOT_FOUND")
        : t("ERROR_FETCH_ACCOUNT_DETAILS");

    return <ErrorView message={errorMessage} />;
  }

  return <AccountDetailsView account={accountDetails!} />;
};

export default AccountDetailsPage;
