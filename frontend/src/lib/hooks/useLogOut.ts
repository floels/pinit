import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { API_URL_LOG_OUT } from "../constants";
import { useAuthContext } from "@/contexts/authContext";
import { useTranslation } from "react-i18next";

export const useLogOut = () => {
  const { setAccessToken } = useAuthContext();
  const { t } = useTranslation("Common");

  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      await fetch(API_URL_LOG_OUT, {
        method: "POST",
        credentials: "include",
      });
    },
    onSuccess: () => {
      setAccessToken(null);
      window.location.href = "/";
    },
    onError: () => {
      toast.warn(t("LOGOUT_ERROR"), {
        toastId: "toast-log-out-error",
      });
    },
  });

  return async () => {
    try {
      await mutateAsync();
    } catch {
      // onError handles the error
    }
  };
};
