import { useAuthenticationContext } from "@/contexts/authenticationContext";
import { refreshAccessToken } from "./refreshAccessToken";
import { fetchExternal, fetchPublic } from "./fetchers";

// The single entry point for API traffic from a component or a hook. It returns
// three named methods, so every call site states whether it needs the access
// token. `fetchPublic` and `fetchExternal` are re-exported unchanged from
// './fetchers': they need no auth state, and they are passed through here only
// so that a call site has one import to reach for.
export const useAPI = () => {
  const { accessToken, setAccessToken, endSession } =
    useAuthenticationContext();

  const fetchAuthenticated = async (url: string, options: RequestInit = {}) => {
    const { headers: existingHeaders, ...restOptions } = options;

    const response = await fetch(url, {
      ...restOptions,
      headers: { ...existingHeaders, Authorization: `Bearer ${accessToken}` },
    });

    if (response.status !== 401) {
      return response;
    }

    // The access token expired, so refresh once and retry. 'refreshAccessToken'
    // is single-flight, so concurrent 401s share one request rather than
    // presenting the rotating refresh cookie several times over.
    const refreshedData = await refreshAccessToken();

    const newAccessToken = refreshedData?.access_token;

    if (!newAccessToken) {
      // Not a logout: the refresh cookie is already invalid, so calling the
      // logout endpoint with it achieves nothing. 'endSession' drops the
      // session locally and keeps the current route, so the user can log back
      // in from the modal and carry on where they were.
      endSession();
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
