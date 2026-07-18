import { useMutation } from "@tanstack/react-query";
import { API_URL_OBTAIN_TOKEN, ERROR_CODE_FETCH_FAILED } from "../constants";
import { useAuthContext } from "@/contexts/authContext";

type LoginCredentials = { email: string; password: string };

export const useLogin = () => {
  const { setAccessToken } = useAuthContext();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      let response: Response;

      try {
        response = await fetch(API_URL_OBTAIN_TOKEN, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(credentials),
          credentials: "include",
        });
      } catch {
        throw new Error(ERROR_CODE_FETCH_FAILED);
      }

      if (!response.ok) {
        const data = await response.json();

        if (data?.errors?.length > 0) {
          throw new Error(data.errors[0]?.code);
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
