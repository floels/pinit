import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import styles from "./FullPageLoadingOverlay.module.css";

const FullPageLoadingOverlay = () => {
  return (
    <div className={styles.overlay} data-testid="full-page-loading-overlay">
      <FontAwesomeIcon
        icon={faSpinner}
        size="2x"
        spin
        className={styles.spinner}
      />
    </div>
  );
};

export default FullPageLoadingOverlay;
