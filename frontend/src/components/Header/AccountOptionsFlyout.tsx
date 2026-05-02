import { useTranslation } from "react-i18next";
import styles from "./AccountOptionsFlyout.module.css";
import { forwardRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faUser } from "@fortawesome/free-solid-svg-icons";
import { TypesOfAccount } from "@/lib/types/frontendTypes";

type AccountOptionsFlyoutProps = {
  displayName: string;
  initial: string;
  profilePictureURL: string | null;
  accountType: TypesOfAccount;
  ownerEmail: string;
  handleClickLogOut: () => void;
};

const AccountOptionsFlyout = forwardRef<
  HTMLDivElement,
  AccountOptionsFlyoutProps
>((props, ref) => {
  const { displayName, initial, profilePictureURL, accountType, ownerEmail, handleClickLogOut } = props;

  const { t } = useTranslation("HeaderAuthenticated");

  const accountTypeLabel =
    accountType === TypesOfAccount.PERSONAL ? t("PERSONAL") : t("BUSINESS");

  const profilePicture = profilePictureURL ? (
    <img
      src={profilePictureURL}
      alt={t("ALT_PROFILE_PICTURE")}
      width={40}
      height={40}
      className={styles.profilePicture}
    />
  ) : (
    <div className={styles.profilePictureFallback}>
      {initial || <FontAwesomeIcon icon={faUser} />}
    </div>
  );

  return (
    <div
      ref={ref}
      className={styles.container}
      data-testid="account-options-flyout"
    >
      <div className={styles.currentlyInLabel}>{t("CURRENTLY_IN")}</div>
      <div className={styles.accountCard}>
        {profilePicture}
        <div className={styles.accountInfo}>
          <div className={styles.displayName}>{displayName}</div>
          <div className={styles.accountTypeRow}>
            <span>{accountTypeLabel}</span>
            <FontAwesomeIcon icon={faCheck} className={styles.checkIcon} />
          </div>
          <div className={styles.ownerEmail}>{ownerEmail}</div>
        </div>
      </div>
      <button
        onClick={handleClickLogOut}
        className={styles.logoutButton}
        data-testid="account-options-flyout-log-out-button"
      >
        {t("LOG_OUT")}
      </button>
    </div>
  );
});

AccountOptionsFlyout.displayName = "AccountOptionsFlyout";

export default AccountOptionsFlyout;
