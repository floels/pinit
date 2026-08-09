import { Navigate } from "react-router";
import { useAuthContext } from "@/contexts/authContext";
import PinCreationViewContainer from "@/components/PinCreationView/PinCreationViewContainer";

const PinCreationToolPage = () => {
  const { accessToken, sessionExpired } = useAuthContext();

  if (!accessToken) {
    // A session that expired keeps this URL, so a successful login from the
    // modal lands the user back here. A visitor who never logged in goes home.
    if (sessionExpired) {
      return null;
    }

    return <Navigate to="/" replace />;
  }

  return <PinCreationViewContainer />;
};

export default PinCreationToolPage;
