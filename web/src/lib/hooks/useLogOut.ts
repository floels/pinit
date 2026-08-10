import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { API_URL_LOG_OUT } from "../constants";
import { useAuthenticationContext } from "@/contexts/authenticationContext";
import { fetchWithRefreshCookie } from "@/lib/api/fetchers";

export const useLogOut = () => {
  const { clearSession } = useAuthenticationContext();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      await fetchWithRefreshCookie(API_URL_LOG_OUT, {
        method: "DELETE",
      });
    },
    // Best-effort logout: complete it locally whether or not the server call
    // succeeded, so a failed request never leaves the user stuck logged in.
    // The refresh token is revoked server-side on success; on failure it simply
    // expires. The access token is in-memory only and is cleared here.
    onSettled: () => {
      clearSession();

      // The next account to log in can be a different person, so no cached
      // query of this one may survive. Only the account query is keyed by the
      // access token: pin suggestions, boards and created pins are not.
      queryClient.removeQueries();

      navigate("/");
    },
  });

  return async () => {
    try {
      await mutateAsync();
    } catch {
      // onSettled already completed the local logout.
    }
  };
};
