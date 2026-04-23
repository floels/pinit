import { useEffect } from "react";
import { API_URL_REFRESH_TOKEN } from "@/lib/constants";
import { useAuthContext } from "@/contexts/authContext";
import { useQuery } from "@tanstack/react-query";

const AccessTokenRefresher = () => {
  const { setAccessToken, setIsAuthInitialized } = useAuthContext();

  const fetchRefreshedAccessToken = async () => {
    const response = await fetch(API_URL_REFRESH_TOKEN, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      return null;
    }

    return response.json();
  };

  const { data, status } = useQuery({
    queryKey: ["refreshAccessToken"],
    queryFn: fetchRefreshedAccessToken,
    retry: false,
  });

  useEffect(() => {
    if (status === "success") {
      if (data?.access_token) {
        setAccessToken(data.access_token);
      }
      setIsAuthInitialized(true);
    } else if (status === "error") {
      setIsAuthInitialized(true);
    }
  }, [status, data]);

  return null;
};

export default AccessTokenRefresher;
