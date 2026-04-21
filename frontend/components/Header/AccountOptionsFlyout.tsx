import { useTranslation } from "react-i18next";
import styles from "./AccountOptionsFlyout.module.css";
import { forwardRef } from "react";

type AccountOptionsFlyoutProps = {
  handleClickLogOut: () => void;
};

const AccountOptionsFlyout = forwardRef<
  HTMLDivElement,
  AccountOptionsFlyoutProps
>((props, ref) => {
  const { handleClickLogOut } = props;

  const { t } = useTranslation("HeaderAuthenticated");

  return (
    <div
      ref={ref}
      className={styles.container}
      data-testid="account-options-flyout"
    >
      <div className={styles.moreOptionsContainer}>
        <div className={styles.moreOptionsLabel}>{t("MORE_OPTIONS")}</div>
        <button
          onClick={handleClickLogOut}
          className={styles.logoutButton}
          data-testid="account-options-flyout-log-out-button"
        >
          {t("LOG_OUT")}
        </button>
      </div>
    </div>
  );
});

AccountOptionsFlyout.displayName = "AccountOptionsFlyout";

export default AccountOptionsFlyout;
