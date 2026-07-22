import { useRef } from "react";
import { useLocation } from "react-router";
import { Link } from "react-router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faUser } from "@fortawesome/free-solid-svg-icons";
import HeaderSearchBarContainer from "./HeaderSearchBarContainer";
import styles from "./HeaderAuthenticated.module.css";
import { useTranslation } from "react-i18next";
import AccountOptionsFlyoutContainer from "./AccountOptionsFlyoutContainer";

type HeaderAuthenticatedProps = {
  username: string | null;
  initial: string | null;
  profilePictureURL: string | null;
  isAccountOptionsFlyoutOpen: boolean;
  handleClickAccountOptionsButton: () => void;
  handleClickOutOfAccountOptionsFlyout: () => void;
};

const HeaderAuthenticated = ({
  username,
  initial,
  profilePictureURL,
  isAccountOptionsFlyoutOpen,
  handleClickAccountOptionsButton,
  handleClickOutOfAccountOptionsFlyout,
}: HeaderAuthenticatedProps) => {
  const { pathname } = useLocation();

  const { t } = useTranslation("HeaderAuthenticated");

  const accountOptionsButtonRef = useRef<HTMLButtonElement>(null);

  const profileLinkBadge = profilePictureURL ? (
    <img
      src={profilePictureURL}
      alt={t("ALT_PROFILE_PICTURE")}
      width={24}
      height={24}
      className={styles.profilePicture}
      data-testid="profile-picture"
    />
  ) : (
    <div className={styles.profileLinkBadge}>
      {initial || <FontAwesomeIcon icon={faUser} data-testid="profile-link-icon" />}
    </div>
  );

  return (
    <nav className={styles.container}>
      <div className={styles.headerItemsContainer}>
        {/* Trick: we render <HeaderSearchBar /> with a key containing the current pathname.
            This way, the component will be re-rendered on each route transition, and its value
            will be cleared. */}
        <HeaderSearchBarContainer
          key={`header-search-bar-pathname-${pathname}`}
        />
        {username && (
          <div className={styles.profileLinkWrapper}>
            <Link
              to={`/${username}`}
              className={styles.profileLink}
              data-testid="profile-link"
            >
              {profileLinkBadge}
            </Link>
            <div className={styles.tooltip}>{t("YOUR_PROFILE")}</div>
          </div>
        )}
        <div className={styles.accountOptionsButtonWrapper}>
          <button
            ref={accountOptionsButtonRef}
            className={styles.accountOptionsButton}
            data-testid="account-options-button"
            onClick={handleClickAccountOptionsButton}
          >
            <FontAwesomeIcon icon={faAngleDown} />
          </button>
          <div className={styles.tooltip}>{t("ACCOUNT_OPTIONS")}</div>
        </div>
      </div>
      {isAccountOptionsFlyoutOpen && (
        <AccountOptionsFlyoutContainer
          handleClickOutOfAccountOptionsFlyout={
            handleClickOutOfAccountOptionsFlyout
          }
          openerRef={accountOptionsButtonRef}
        />
      )}
    </nav>
  );
};

export default HeaderAuthenticated;
