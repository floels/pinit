import { Navigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/authContext";
import PinCreationViewContainer from "@/components/PinCreationView/PinCreationViewContainer";

const PinCreationToolPage = () => {
  const { accessToken } = useAuthContext();

  if (!accessToken) {
    return <Navigate to="/" replace />;
  }

  return <PinCreationViewContainer />;
};

export default PinCreationToolPage;
