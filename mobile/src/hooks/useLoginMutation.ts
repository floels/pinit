import { useMutation } from "@tanstack/react-query";

import { useAuthenticationContext } from "@/src/contexts/authenticationContext";
import { fetchPublic } from "@/src/lib/api/fetchers";
import { API_BASE_URL, API_ENDPOINT_OBTAIN_TOKEN } from "@/src/lib/constants";
import { Response401Error } from "@/src/lib/customErrors";
import { persistTokensData } from "@/src/lib/utils/authentication";
import { throwIfKO } from "@/src/lib/utils/fetch";

type LoginCredentials = {
  email: string;
  password: string;
};

type ObtainedTokens = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpirationDate: string;
};

const obtainTokens = async ({
  email,
  password,
}: LoginCredentials): Promise<ObtainedTokens> => {
  const response = await fetchPublic(
    `${API_BASE_URL}/${API_ENDPOINT_OBTAIN_TOKEN}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    },
  );

  if (response.status === 401) {
    const responseData = await response.json();

    const errorMessage = responseData.errors?.[0]?.code;

    throw new Response401Error(errorMessage);
  }

  throwIfKO(response);

  const responseData = await response.json();

  return {
    accessToken: responseData.access_token,
    refreshToken: responseData.refresh_token,
    accessTokenExpirationDate: responseData.access_token_expiration_utc,
  };
};

// Obtains tokens, persists them, and starts a Session. Call sites own
// loading/error UX; this hook owns the write + SESSION_STARTED side effects.
export const useLoginMutation = () => {
  const { dispatch } = useAuthenticationContext();

  return useMutation({
    mutationFn: obtainTokens,
    onSuccess: async (tokens) => {
      await persistTokensData(tokens);
      dispatch({ type: "SESSION_STARTED" });
    },
  });
};
