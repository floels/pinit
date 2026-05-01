import { useLocation, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import { faSquarePlus } from "@fortawesome/free-regular-svg-icons";
import { useTranslation } from "react-i18next";
import styles from "./SidebarAuthenticated.module.css";

const SidebarAuthenticated = () => {
  const { pathname } = useLocation();
  const { t } = useTranslation("HeaderAuthenticated");

  const isHomeActive = pathname === "/";
  const isCreateActive = pathname === "/pin-creation-tool";

  return (
    <nav className={styles.sidebar}>
      <div className={styles.top}>
        <Link to="/" className={styles.logoButton}>
          <img src="/images/logo.svg" alt="PinIt logo" width={24} height={24} />
        </Link>
        <div className={styles.navItemWrapper}>
          <Link
            to="/"
            className={`${styles.navItem} ${isHomeActive ? styles.navItemActive : ""}`}
            data-testid="sidebar-home-link"
          >
            <FontAwesomeIcon icon={faHouse} />
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
