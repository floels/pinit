import { toast } from "react-toastify";
import { API_ROUTE_LOG_OUT } from "../constants";
import { useTranslation } from "react-i18next";

export const useLogOut = () => {
  const { t } = useTranslation("Common");

  const logOut = async () => {
    try {
      await fetch(API_ROUTE_LOG_OUT, {
        method: "POST",
      });

      window.location.href = "/";
    } catch {
      toast.warn(t("LOGOUT_ERROR"), {
        toastId: "toast-log-out-error",
      });
    }
  };
  return logOut;
};
