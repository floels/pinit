import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/authContext";
import { API_URL_PIN_SUGGESTIONS } from "@/lib/constants";
import { useFetchWithAuth } from "@/lib/hooks/useFetchWithAuth";
import { serializePinsWithAuthorDetails } from "@/lib/utils/serializers";
import { throwIfKO } from "@/lib/utils/fetch";
import LandingPageContent from "@/components/LandingPageContent/LandingPageContent";
import PinsBoardContainer from "@/components/PinsBoard/PinsBoardContainer";
import ErrorView from "@/components/ErrorView/ErrorView";
import SpinnerBelowHeader from "@/components/Spinners/SpinnerBelowHeader";

const HomePage = () => {
  const { accessToken } = useAuthContext();
  const fetchWithAuth = useFetchWithAuth();

  const fetchPinSuggestions = async () => {
    const response = await fetchWithAuth(API_URL_PIN_SUGGESTIONS);

    throwIfKO(response);

    const { results } = await response.json();

    return serializePinsWithAuthorDetails(results);
  };

  const { data: initialPins, error, isLoading } = useQuery({
    queryKey: ["pin-suggestions"],
    queryFn: fetchPinSuggestions,
    enabled: !!accessToken,
  });

  if (!accessToken) {
    return <LandingPageContent />;
  }

  if (isLoading) {
    return <SpinnerBelowHeader />;
  }

  if (error) {
    return <ErrorView errorMessageKey="HomePageContent.ERROR_FETCH_PIN_SUGGESTIONS" />;
  }

  return (
    <PinsBoardContainer
      initialPins={initialPins!}
      fetchPinsAPIRoute={API_URL_PIN_SUGGESTIONS}
    />
  );
};

export default HomePage;
