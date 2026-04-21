import { BoardWithBasicDetails } from "@/lib/types/frontendTypes";
import styles from "./SaveInBoardButton.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChessBoard } from "@fortawesome/free-solid-svg-icons";
import { ellipsizeText } from "@/lib/utils/strings";
import { useTranslation } from "react-i18next";

type SaveInBoardButtonProps = {
  board: BoardWithBasicDetails;
  isHovered: boolean;
  handleClick: () => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
};

const SaveInBoardButton = ({
  board,
  isHovered,
  handleClick,
  handleMouseEnter,
  handleMouseLeave,
}: SaveInBoardButtonProps) => {
  const { t } = useTranslation("PinsBoard");

  const { name, firstImageURLs } = board;

  const coverPictureURL = firstImageURLs.length > 0 ? firstImageURLs[0] : null;

  let boardThumbnail;

  if (coverPictureURL) {
    boardThumbnail = (
      <img
        src={coverPictureURL}
        alt={name}
        width={40}
        height={40}
        className={styles.thumbnailImage}
      />
    );
  } else {
    boardThumbnail = (
      <div className={styles.thumbnailIconContainer}>
        <FontAwesomeIcon icon={faChessBoard} size="2x" />
      </div>
    );
  }

  const textLongEllipsis = ellipsizeText({ text: name, maxLength: 40 });
  const textShortEllipsis = ellipsizeText({ text: name, maxLength: 20 });

  const saveButton = (
    <span className={styles.saveButton} data-testid="board-button-save-button">
      {t("SAVE_IN_BOARD_BUTTON_TEXT")}
    </span>
  );

  return (
    <button
      className={styles.container}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={styles.boardThumbnailAndTitle}>
        {boardThumbnail}
        <span className={styles.boardTitle}>
          {isHovered ? textShortEllipsis : textLongEllipsis}
        </span>
      </div>
      {isHovered && saveButton}
    </button>
  );
};

export default SaveInBoardButton;
