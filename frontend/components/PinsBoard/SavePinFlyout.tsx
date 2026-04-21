import { useTranslation } from "react-i18next";
import SaveInBoardButtonContainer from "./SaveInBoardButtonContainer";
import styles from "./SavePinFlyout.module.css";
import { BoardWithBasicDetails } from "@/lib/types/frontendTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { forwardRef } from "react";
import classNames from "classnames";

type SavePinFlyoutProps = {
  isInFirstColumn: boolean;
  isInLastColumn: boolean;
  boards: BoardWithBasicDetails[];
  isSaving: boolean;
  getClickHandlerForBoard: ({
    boardIndex,
  }: {
    boardIndex: number;
  }) => () => void;
};

const SavePinFlyout = forwardRef<HTMLDivElement, SavePinFlyoutProps>(
  (props, ref) => {
    const {
      isInFirstColumn,
      isInLastColumn,
      boards,
      isSaving,
      getClickHandlerForBoard,
    } = props;

    const { t } = useTranslation("PinsBoard");

    const saveInBoardButtons = (
      <div data-testid="save-pin-flyout-board-buttons">
        {boards.map((board, index) => (
          <SaveInBoardButtonContainer
            board={board}
            key={`board-${index}`}
            handleClick={getClickHandlerForBoard({ boardIndex: index })}
          />
        ))}
      </div>
    );

    const containerStyles = classNames(styles.container, {
      [styles.containerAlignedLeft]: isInFirstColumn,
      [styles.containerAlignedRight]: isInLastColumn,
      [styles.containerCentered]: !isInFirstColumn && !isInLastColumn,
    });

    return (
      <div className={containerStyles} ref={ref}>
        <span className={styles.title}>
          {t("PIN_THUMBNAIL_SAVE_FLYOUT_TITLE")}
        </span>
        <div className={styles.boardsLabelAndList}>
          <span className={styles.boardsLabel}>
            {t("PIN_THUMBNAIL_SAVE_FLYOUT_BOARDS_LABEL")}
          </span>
          {saveInBoardButtons}
        </div>
        {isSaving && (
          <div className={styles.loadingOverlay}>
            <FontAwesomeIcon
              icon={faSpinner}
              size="2x"
              spin
              className={styles.loadingSpinner}
            />
          </div>
        )}
      </div>
    );
  },
);

SavePinFlyout.displayName = "SavePinFlyout";

export default SavePinFlyout;
