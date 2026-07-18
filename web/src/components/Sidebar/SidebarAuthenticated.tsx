import { useLocation, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSquarePlus } from "@fortawesome/free-regular-svg-icons";
import { useTranslation } from "react-i18next";
import styles from "./SidebarAuthenticated.module.css";

const HomeIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    width={20}
    height={20}
  >
    <path d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V10.5z" />
    <path d="M9 21V13h6v8" />
  </svg>
);

const SidebarAuthenticated = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation("HeaderAuthenticated");

  const isHomeActive = pathname === "/";
  const isCreateActive = pathname === "/pin-creation-tool";

  return (
    <nav className={styles.sidebar}>
      <div className={styles.top}>
        <div className={styles.navItemWrapper}>
          <Link to="/" className={styles.logoButton}>
            <img src="/images/logo.svg" alt="PinIt logo" width={24} height={24} />
          </Link>
          <span className={styles.tooltip}>{t("NAV_ITEM_HOME")}</span>
        </div>
        <div className={styles.navItemWrapper}>
          <Link
            to="/"
            className={`${styles.navItem} ${isHomeActive ? styles.navItemActive : ""}`}
            data-testid="sidebar-home-link"
          >
            <HomeIcon />
          </Link>
          <span className={styles.tooltip}>{t("NAV_ITEM_HOME")}</span>
        </div>
        <div className={styles.navItemWrapper}>
          <Link
            to="/pin-creation-tool"
            className={`${styles.navItem} ${isCreateActive ? styles.navItemActive : ""}`}
            data-testid="sidebar-create-link"
          >
            <FontAwesomeIcon icon={faSquarePlus} />
          </Link>
          <span className={styles.tooltip}>{t("NAV_ITEM_CREATE")}</span>
        </div>
      </div>
    </nav>
  );
};

export default SidebarAuthenticated;
