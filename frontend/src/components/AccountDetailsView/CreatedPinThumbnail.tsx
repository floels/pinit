import { useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./CreatedPinThumbnail.module.css";
import {
  BoardWithBasicDetails,
  PinWithFullDetails,
} from "@/lib/types/frontendTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faPencil } from "@fortawesome/free-solid-svg-icons";
import SavePinFlyoutContainer from "../PinsBoard/SavePinFlyoutContainer";

type CreatedPinThumbnailProps = {
  pin: PinWithFullDetails;
  isInFirstColumn: boolean;
  isInLastColumn: boolean;
  boards: BoardWithBasicDetails[];
  isImageHovered: boolean;
  isSaveFlyoutOpen: boolean;
  isSaving: boolean;
  indexBoardWhereJustSaved: number | null;
  isOwnProfile: boolean;
  handleMouseEnterImage: () => void;
  handleMouseLeaveImage: () => void;
  handleClickSave: (event: React.MouseEvent<HTMLButtonElement>) => void;
  getClickHandlerForBoard: ({
    boardIndex,
  }: {
    boardIndex: number;
  }) => () => void;
  handleClickOutOfSaveFlyout: () => void;
  handleClickCreateBoard: () => void;
  handleClickEdit: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const CreatedPinThumbnail = ({
  pin,
  isInFirstColumn,
  isInLastColumn,
  boards,
  isImageHovered,
  isSaveFlyoutOpen,
  isSaving,
  indexBoardWhereJustSaved,
  isOwnProfile,
  handleMouseEnterImage,
  handleMouseLeaveImage,
  handleClickSave,
  getClickHandlerForBoard,
  handleClickOutOfSaveFlyout,
  handleClickCreateBoard,
  handleClickEdit,
}: CreatedPinThumbnailProps) => {
  const { t } = useTranslation("PinsBoard");
  const { t: tCreated } = useTranslation("CreatedPins");

  const saveButtonRef = useRef<HTMLButtonElement>(null);

  const hasSaved = indexBoardWhereJustSaved !== null;

  let imageOverlay;

  if (hasSaved) {
    const boardName = boards[indexBoardWhereJustSaved].name;

    imageOverlay = (
      <div className={styles.hoverOverlay}>
        <div className={styles.hoverOverlayContentSaved}>
          <span className={styles.boardTitle}>{boardName}</span>
          <span className={styles.savedLabel}>
            {t("PIN_THUMBNAIL_SAVED_LABEL_TEXT")}
          </span>
        </div>
      </div>
    );
  } else {
    imageOverlay = (
      <div className={styles.hoverOverlay}>
        <div className={styles.hoverOverlayContentNotSaved}>
          <button
            ref={saveButtonRef}
            className={styles.saveButton}
            onClick={handleClickSave}
            data-testid="created-pin-save-button"
          >
            <span className={styles.saveButtonText}>
              {t("PIN_THUMBNAIL_SAVE_BUTTON_TEXT")}
            </span>
            <FontAwesomeIcon icon={faAngleDown} size="lg" />
          </button>
        </div>
      </div>
    );
  }

  const shouldShowImageOverlay = isImageHovered || isSaveFlyoutOpen;

  return (
    <div
      className={styles.container}
      onMouseEnter={handleMouseEnterImage}
      onMouseLeave={handleMouseLeaveImage}
      data-testid="created-pin-thumbnail"
    >
      <Link
        to={`/pin/${pin.id}`}
        className={styles.imageContainer}
        data-testid="created-pin-thumbnail-image"
      >
        <img
          alt={
            pin.title
              ? pin.title
              : `${t("ALT_PIN_BY")} ${pin.author.displayName}`
          }
          src={pin.imageURL}
          className={styles.image}
        />
        {shouldShowImageOverlay && imageOverlay}
      </Link>
      {isSaveFlyoutOpen && (
        <SavePinFlyoutContainer
          isInFirstColumn={isInFirstColumn}
          isInLastColumn={isInLastColumn}
          boards={boards}
          isSaving={isSaving}
          getClickHandlerForBoard={getClickHandlerForBoard}
          handleClickOutOfSaveFlyout={handleClickOutOfSaveFlyout}
          handleClickCreateBoard={handleClickCreateBoard}
          openerRef={saveButtonRef}
        />
      )}
      <div className={styles.belowImageRow}>
        {pin.title && (
          <span className={styles.pinTitle} data-testid="created-pin-title">
            {pin.title}
          </span>
        )}
        {isOwnProfile && (
          <div className={styles.editButtonWrapper}>
            <button
              className={styles.editButton}
              onClick={handleClickEdit}
              data-testid="created-pin-edit-button"
            >
              <FontAwesomeIcon icon={faPencil} />
            </button>
            <div className={styles.editButtonTooltip}>
              {tCreated("EDIT_BUTTON_TOOLTIP")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatedPinThumbnail;
