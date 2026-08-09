import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { API_URL_PIN_DETAILS } from "@/lib/constants";
import { throwIfKO } from "@/lib/utils/fetch";
import { fetchPublic } from "@/lib/api/fetchers";
import { serializePinWithFullDetails } from "@/lib/utils/serializers";
import { Response404Error } from "@/lib/customErrors";
import PinDetailsView from "@/components/PinDetailsView/PinDetailsView";
import ErrorView from "@/components/ErrorView/ErrorView";
import SpinnerBelowHeader from "@/components/Spinners/SpinnerBelowHeader";

const PinDetailsPage = () => {
  const { t } = useTranslation("PinDetails");
  const { id } = useParams<{ id: string }>();

  const fetchPinDetails = async () => {
    const url = `${API_URL_PIN_DETAILS}/${id}/`;

    const response = await fetchPublic(url);

    if (response.status === 404) {
      throw new Response404Error();
    }

    throwIfKO(response);

    const responseData = await response.json();

    return serializePinWithFullDetails(responseData);
  };

  const { data: pinDetails, error, isLoading } = useQuery({
    queryKey: ["pin", id],
    queryFn: fetchPinDetails,
  });

  if (isLoading) {
    return <SpinnerBelowHeader />;
  }

  if (error) {
    const errorMessage =
      error instanceof Response404Error
        ? t("ERROR_PIN_NOT_FOUND")
        : t("ERROR_FETCH_PIN_DETAILS");

    return <ErrorView message={errorMessage} />;
  }

  return <PinDetailsView pin={pinDetails!} />;
};

export default PinDetailsPage;
