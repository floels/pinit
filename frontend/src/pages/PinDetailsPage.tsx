import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_BASE_URL, API_ENDPOINT_PIN_DETAILS } from "@/lib/constants";
import { throwIfKO } from "@/lib/utils/fetch";
import { serializePinWithFullDetails } from "@/lib/utils/serializers";
import { Response404Error } from "@/lib/customErrors";
import { PinWithFullDetails } from "@/lib/types/frontendTypes";
import PinDetailsView from "@/components/PinDetailsView/PinDetailsView";
import ErrorView from "@/components/ErrorView/ErrorView";
import SpinnerBelowHeader from "@/components/Spinners/SpinnerBelowHeader";

const PinDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [pin, setPin] = useState<PinWithFullDetails | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchPin = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/${API_ENDPOINT_PIN_DETAILS}/${id}/`,
        );

        if (response.status === 404) throw new Response404Error();

        throwIfKO(response);

        const data = await response.json();
        setPin(serializePinWithFullDetails(data));
      } catch (err) {
        setError(err as Error);
      }
    };

    fetchPin();
  }, [id]);

  if (error) {
    const errorMessageKey =
      error instanceof Response404Error
        ? "PinDetails.ERROR_PIN_NOT_FOUND"
        : "PinDetails.ERROR_FETCH_PIN_DETAILS";
    return <ErrorView errorMessageKey={errorMessageKey} />;
  }

  if (!pin) {
    return <SpinnerBelowHeader />;
  }

  return <PinDetailsView pin={pin} />;
};

export default PinDetailsPage;
