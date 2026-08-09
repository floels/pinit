import { useQueryClient } from "@tanstack/react-query";
import { useAuthContext } from "@/contexts/authContext";
import { useLogOut } from "@/lib/hooks/useLogOut";
import {
  REFRESH_ACCESS_TOKEN_QUERY_KEY,
  fetchRefreshedAccessToken,
} from "./refreshAccessToken";
import { fetchExternal, fetchPublic } from "./fetchers";

// The single entry point for API traffic from a component or a hook. It returns
// three named methods, so every call site states whether it needs the access
// token. `fetchPublic` and `fetchExternal` are re-exported unchanged from
// './fetchers': they need no auth state, and they are passed through here only
// so that a call site has one import to reach for.
export const useAPI = () => {
  const { accessToken, setAccessToken } = useAuthContext();
  const queryClient = useQueryClient();
  const logOut = useLogOut();

  const fetchAuthenticated = async (url: string, options: RequestInit = {}) => {
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
      headers: {
        ...existingHeaders,
        Authorization: `Bearer ${newAccessToken}`,
      },
    });
  };

  return { fetchAuthenticated, fetchPublic, fetchExternal };
};
