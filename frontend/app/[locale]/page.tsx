import { cookies } from "next/headers";
import LandingPageContent from "@/components/LandingPageContent/LandingPageContent";
import PinsBoardContainer from "@/components/PinsBoard/PinsBoardContainer";
import { fetchWithAuthentication, throwIfKO } from "@/lib/utils/fetch";
import {
  API_ROUTE_PIN_SUGGESTIONS,
  API_ENDPOINT_PIN_SUGGESTIONS,
  ACCESS_TOKEN_COOKIE_KEY,
} from "@/lib/constants";
import { serializePinsWithAuthorDetails } from "@/lib/utils/serializers";
import { MalformedResponseError, Response401Error } from "@/lib/customErrors";
import ErrorView from "@/components/ErrorView/ErrorView";
import LogoutTrigger from "@/components/LogoutTrigger/LogoutTrigger";

const fetchInitialPinSuggestions = async ({
  accessToken,
}: {
  accessToken: string;
}) => {
  const response = await fetchWithAuthentication({
    endpoint: API_ENDPOINT_PIN_SUGGESTIONS,
    accessToken,
  });

  if (response.status === 401) {
    throw new Response401Error();
  }

  throwIfKO(response);

  const { results } = await response.json();

  if (!results || !results?.length) {
    throw new MalformedResponseError();
  }

  const initialPinSuggestions = serializePinsWithAuthorDetails(results);

  return initialPinSuggestions;
};

const Page = async () => {
  const accessTokenCookie = cookies().get(ACCESS_TOKEN_COOKIE_KEY);

  if (!accessTokenCookie) {
    return <LandingPageContent />;
  }

  const accessToken = accessTokenCookie.value;

  let initialPinSuggestions;

  try {
    initialPinSuggestions = await fetchInitialPinSuggestions({
      accessToken,
    });
  } catch (error) {
    if (error instanceof Response401Error) {
      return <LogoutTrigger />;
    }

    return (
      <ErrorView errorMessageKey="HomePageContent.ERROR_FETCH_PIN_SUGGESTIONS" />
    );
  }

  return (
    <PinsBoardContainer
      initialPins={initialPinSuggestions}
      fetchPinsAPIRoute={API_ROUTE_PIN_SUGGESTIONS}
    />
  );
};

export default Page;
