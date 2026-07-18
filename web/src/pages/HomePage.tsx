import { useAuthContext } from "@/contexts/authContext";
import { API_URL_PIN_SUGGESTIONS } from "@/lib/constants";
import { useFetchWithAuth } from "@/lib/hooks/useFetchWithAuth";
import LandingPageContent from "@/components/LandingPageContent/LandingPageContent";
import PinsBoardContainer from "@/components/PinsBoard/PinsBoardContainer";

const HomePage = () => {
  const { accessToken } = useAuthContext();
  const fetchWithAuth = useFetchWithAuth();

  if (!accessToken) {
    return <LandingPageContent />;
  }

  return (
    <PinsBoardContainer
      queryKey={["pin-suggestions"]}
      fetchPinsAPIRoute={API_URL_PIN_SUGGESTIONS}
      fetchFn={fetchWithAuth}
      errorMessageKey="HomePageContent.ERROR_FETCH_PIN_SUGGESTIONS"
    />
  );
};

export default HomePage;
