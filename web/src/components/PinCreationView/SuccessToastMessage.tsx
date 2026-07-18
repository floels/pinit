import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styles from "./SuccessToastMessage.module.css";

type SuccessToastMessageProps = {
  pinId: string;
};

const SuccessToastMessage = ({ pinId }: SuccessToastMessageProps) => {
  const { t } = useTranslation("PinCreation");

  return (
    <div
      className={styles.successToastMessageContainer}
      data-testid="success-toast-message"
    >
      <p>{t("PIN_PUBLISHED")}</p>
      <Link to={`/pin/${pinId}`} className={styles.successToastMessageLink}>
        {t("VIEW")}
      </Link>
    </div>
  );
};

export default SuccessToastMessage;
