import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL, API_ENDPOINT_PIN_DETAILS } from "@/lib/constants";
import { throwIfKO } from "@/lib/utils/fetch";
import { serializePinWithFullDetails } from "@/lib/utils/serializers";
import { Response404Error } from "@/lib/customErrors";
import PinDetailsView from "@/components/PinDetailsView/PinDetailsView";
import ErrorView from "@/components/ErrorView/ErrorView";
import SpinnerBelowHeader from "@/components/Spinners/SpinnerBelowHeader";

const PinDetailsPage = () => {
  const { id } = useParams<{ id: string }>();

  const fetchPinDetails = async () => {
    const url = `${API_BASE_URL}/${API_ENDPOINT_PIN_DETAILS}/${id}/`;

    const response = await fetch(url);

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
    const errorMessageKey =
      error instanceof Response404Error
        ? "PinDetails.ERROR_PIN_NOT_FOUND"
        : "PinDetails.ERROR_FETCH_PIN_DETAILS";

    return <ErrorView errorMessageKey={errorMessageKey} />;
  }

  return <PinDetailsView pin={pinDetails!} />;
};

export default PinDetailsPage;
