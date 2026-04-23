import { toast } from "react-toastify";
import { API_URL_LOG_OUT } from "../constants";
import { useAuthContext } from "@/contexts/authContext";
import { useTranslation } from "react-i18next";

export const useLogOut = () => {
  const { setAccessToken } = useAuthContext();
  const { t } = useTranslation("Common");

  const logOut = async () => {
    try {
      await fetch(API_URL_LOG_OUT, {
        method: "POST",
        credentials: "include",
      });

      setAccessToken(null);
      window.location.href = "/";
    } catch {
      toast.warn(t("LOGOUT_ERROR"), {
        toastId: "toast-log-out-error",
      });
    }
  };
  return logOut;
};
