import { Navigate } from "react-router";
import { useAuthContext } from "@/contexts/authContext";
import PinCreationViewContainer from "@/components/PinCreationView/PinCreationViewContainer";

const PinCreationToolPage = () => {
  const { accessToken, isPromptingLogin } = useAuthContext();

  if (!accessToken) {
    // The app is asking for a login, so hold this URL. The modal covers the page
    // anyway, and a successful login lands the user back here. Once the user
    // declines, the prompt stops and the redirect below takes over.
    if (isPromptingLogin) {
      return null;
    }

    // Nobody is being asked to log in, so this is a visitor with no session.
    return <Navigate to="/" replace />;
  }

  return <PinCreationViewContainer />;
};

export default PinCreationToolPage;
