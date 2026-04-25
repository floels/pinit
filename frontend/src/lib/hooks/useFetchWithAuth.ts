import { useAuthContext } from "@/contexts/authContext";
import { API_URL_REFRESH_TOKEN } from "../constants";
import { useLogOut } from "./useLogOut";

export const useFetchWithAuth = () => {
  const { accessToken, setAccessToken } = useAuthContext();
  const logOut = useLogOut();

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const { headers: existingHeaders, ...restOptions } = options;

    const response = await fetch(url, {
      ...restOptions,
      headers: { ...existingHeaders, Authorization: `Bearer ${accessToken}` },
    });

    if (response.status !== 401) {
      return response;
    }

    const refreshResponse = await fetch(API_URL_REFRESH_TOKEN, {
      method: "POST",
      credentials: "include",
    });

    if (!refreshResponse.ok) {
      logOut();
      return response;
    }

    const { access_token: newAccessToken } = await refreshResponse.json();
    setAccessToken(newAccessToken);

    return fetch(url, {
      ...restOptions,
      headers: { ...existingHeaders, Authorization: `Bearer ${newAccessToken}` },
    });
  };

  return fetchWithAuth;
};
