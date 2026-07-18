import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import styles from "./SpinnerBelowHeader.module.css";

const SpinnerBelowHeader = () => {
  return (
    <div className={styles.container}>
      <FontAwesomeIcon
        icon={faSpinner}
        size="2x"
        spin
        className={styles.spinner}
      />
    </div>
  );
};

export default SpinnerBelowHeader;
