import { useAuthContext } from "@/contexts/authContext";
import { API_URL_REFRESH_TOKEN } from "@/lib/constants";

export const useLogIn = () => {
  const { setAccessToken } = useAuthContext();

  return async () => {
    const response = await fetch(API_URL_REFRESH_TOKEN, {
      method: "POST",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      setAccessToken(data.access_token);
    }
  };
};
