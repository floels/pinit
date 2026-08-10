import { useMutation } from "@tanstack/react-query";
import { API_URL_SIGN_UP, ERROR_CODE_FETCH_FAILED } from "../constants";
import { useAuthenticationContext } from "@/contexts/authenticationContext";
import { fetchWithRefreshCookie } from "@/lib/api/fetchers";

type SignupData = { email: string; password: string; birthdate: string };

export const useSignup = () => {
  const { setAccessToken } = useAuthenticationContext();

  return useMutation({
    mutationFn: async (data: SignupData) => {
      let response: Response;

      try {
        response = await fetchWithRefreshCookie(API_URL_SIGN_UP, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      } catch {
        throw new Error(ERROR_CODE_FETCH_FAILED);
      }

      if (!response.ok) {
        const responseData = await response.json();

        if (responseData?.errors?.length > 0) {
          throw new Error(responseData.errors[0]?.code);
        }

        throw new Error();
      }

      return response.json() as Promise<{ access_token: string }>;
    },
    onSuccess: (data) => {
      setAccessToken(data.access_token);
    },
  });
};
