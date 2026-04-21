import { redirect } from "next/navigation";
import PinDetailsView from "@/components/PinDetailsView/PinDetailsView";
import { API_BASE_URL, API_ENDPOINT_PIN_DETAILS } from "@/lib/constants";
import { serializePinWithFullDetails } from "@/lib/utils/serializers";
import { Response404Error } from "@/lib/customErrors";
import ErrorView from "@/components/ErrorView/ErrorView";
import { throwIfKO } from "@/lib/utils/fetch";

type PageProps = {
  params: { id: string };
};

const fetchPinDetails = async ({ pinId }: { pinId: string }) => {
  const url = `${API_BASE_URL}/${API_ENDPOINT_PIN_DETAILS}/${pinId}/`;

  const response = await fetch(url);

  if (response.status === 404) {
    throw new Response404Error();
  }

  throwIfKO(response);

  const responseData = await response.json();

  return serializePinWithFullDetails(responseData);
};

const renderUponError = ({ error }: { error: Error }) => {
  let errorMessageKey;

  if (error instanceof Response404Error) {
    errorMessageKey = "PinDetails.ERROR_PIN_NOT_FOUND";
  } else {
    errorMessageKey = "PinDetails.ERROR_FETCH_PIN_DETAILS";
  }

  return <ErrorView errorMessageKey={errorMessageKey} />;
};

const Page = async ({ params }: PageProps) => {
  const pinId = params.id;

  if (!pinId) {
    redirect("/");
  }

  let pinDetails;

  try {
    pinDetails = await fetchPinDetails({ pinId });
  } catch (error) {
    return renderUponError({ error: error as Error });
  }

  return <PinDetailsView pin={pinDetails} />;
};

export default Page;
