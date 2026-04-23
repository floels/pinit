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

  const { data: pin, error, isLoading } = useQuery({
    queryKey: ["pin", id],
    queryFn: async () => {
      const response = await fetch(
        `${API_BASE_URL}/${API_ENDPOINT_PIN_DETAILS}/${id}/`,
      );

      if (response.status === 404) throw new Response404Error();

      throwIfKO(response);

      return serializePinWithFullDetails(await response.json());
    },
    retry: (_, error) => !(error instanceof Response404Error),
  });

  if (isLoading) return <SpinnerBelowHeader />;

  if (error) {
    const errorMessageKey =
      error instanceof Response404Error
        ? "PinDetails.ERROR_PIN_NOT_FOUND"
        : "PinDetails.ERROR_FETCH_PIN_DETAILS";
    return <ErrorView errorMessageKey={errorMessageKey} />;
  }

  return <PinDetailsView pin={pin!} />;
};

export default PinDetailsPage;
