import { useEffect } from "react";
import { API_URL_REFRESH_TOKEN } from "@/lib/constants";
import { useAuthContext } from "@/contexts/authContext";
import { useQuery } from "@tanstack/react-query";

type AccessTokenRefresherProps = {
  handleFinishedFetching: () => void;
};

const AccessTokenRefresher = ({
  handleFinishedFetching,
}: AccessTokenRefresherProps) => {
  const { setAccessToken } = useAuthContext();

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
      handleFinishedFetching();
    } else if (status === "error") {
      handleFinishedFetching();
    }
  }, [status, data]);

  return null;
};

export default AccessTokenRefresher;
