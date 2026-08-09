import { useMutation } from "@tanstack/react-query";
import {
  API_URL_LOG_OUT,
  PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY,
  USERNAME_LOCAL_STORAGE_KEY,
} from "../constants";
import { useAuthContext } from "@/contexts/authContext";

export const useLogOut = () => {
  const { setAccessToken } = useAuthContext();

  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      await fetch(API_URL_LOG_OUT, {
        method: "DELETE",
        credentials: "include",
      });
    },
    // Best-effort logout: complete it locally whether or not the server call
    // succeeded, so a failed request never leaves the user stuck logged in.
    // The refresh token is revoked server-side on success; on failure it simply
    // expires. The access token is in-memory only and is cleared here.
    onSettled: () => {
      setAccessToken(null);

      // The cached display data belongs to the account that just logged out.
      // Without this, the header of the next account to log in shows the
      // previous username and profile picture until '/accounts/me/' resolves.
      localStorage?.removeItem(USERNAME_LOCAL_STORAGE_KEY);
      localStorage?.removeItem(PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY);

      window.location.href = "/";
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
