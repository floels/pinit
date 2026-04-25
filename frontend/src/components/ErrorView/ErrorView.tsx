import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import styles from "./ErrorView.module.css";

type ErrorViewProps = {
  message: string;
};

const ErrorView = ({ message }: ErrorViewProps) => {
  return (
    <div className={styles.container}>
      <FontAwesomeIcon icon={faWarning} className={styles.icon} />
      {message}
    </div>
  );
};

export default ErrorView;
