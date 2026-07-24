import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/authContext";
import {
  REFRESH_ACCESS_TOKEN_QUERY_KEY,
  fetchRefreshedAccessToken,
} from "@/lib/utils/refreshAccessToken";
import { useLogOut } from "./useLogOut";

export const useFetchWithAuth = () => {
  const { accessToken, setAccessToken } = useAuthContext();
  const queryClient = useQueryClient();
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

    // Route the refresh through the query cache so concurrent 401s share a
    // single in-flight refresh (TanStack Query dedupes fetchQuery calls on the
    // same key). Without this, simultaneous requests would each refresh and,
    // because refresh tokens rotate, revoke one another — logging the user out.
    const refreshData = await queryClient
      .fetchQuery({
        queryKey: REFRESH_ACCESS_TOKEN_QUERY_KEY,
        queryFn: fetchRefreshedAccessToken,
        staleTime: 0,
        retry: false,
      })
      .catch(() => null);

    const newAccessToken = refreshData?.access_token;

    if (!newAccessToken) {
      logOut();
      return response;
    }

    setAccessToken(newAccessToken);

    return fetch(url, {
      ...restOptions,
      headers: { ...existingHeaders, Authorization: `Bearer ${newAccessToken}` },
    });
  };

  return fetchWithAuth;
};
