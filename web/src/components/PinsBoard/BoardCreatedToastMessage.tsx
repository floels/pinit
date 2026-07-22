import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import styles from "./BoardCreatedToastMessage.module.css";

type BoardCreatedToastMessageProps = {
  username: string;
  slug: string;
};

const BoardCreatedToastMessage = ({
  username,
  slug,
}: BoardCreatedToastMessageProps) => {
  const { t } = useTranslation("PinsBoard");

  return (
    <div
      className={styles.container}
      data-testid="board-created-toast-message"
    >
      <p>{t("CREATE_BOARD_SUCCESS_MESSAGE")}</p>
      <Link
        to={`/${username}/${slug}/`}
        className={styles.viewLink}
        data-testid="board-created-toast-view-link"
      >
        {t("CREATE_BOARD_VIEW_LINK")}
      </Link>
    </div>
  );
};

export default BoardCreatedToastMessage;
