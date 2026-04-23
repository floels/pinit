import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarning } from "@fortawesome/free-solid-svg-icons";
import styles from "./ErrorView.module.css";

type ErrorViewProps = {
  errorMessageKey: string;
};

const ErrorView = ({ errorMessageKey }: ErrorViewProps) => {
  const { t } = useTranslation();

  const [ns, ...rest] = errorMessageKey.split(".");

  return (
    <div className={styles.container}>
      <FontAwesomeIcon icon={faWarning} className={styles.icon} />
      {t(rest.join("."), { ns })}
    </div>
  );
};

export default ErrorView;
