import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./PinThumbnail.module.css";
import {
  BoardWithBasicDetails,
  PinWithAuthorDetails,
} from "@/lib/types/frontendTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown } from "@fortawesome/free-solid-svg-icons";
import SavePinFlyoutContainer from "./SavePinFlyoutContainer";
import { ellipsizeText } from "@/lib/utils/strings";

type PinThumbnailProps = {
  pin: PinWithAuthorDetails;
  isInFirstColumn: boolean;
  isInLastColumn: boolean;
  boards: BoardWithBasicDetails[];
  isImageHovered: boolean;
  isSaveFlyoutOpen: boolean;
  isSaving: boolean;
  indexBoardWhereJustSaved: number | null;
  handleMouseEnterImage: () => void;
  handleMouseLeaveImage: () => void;
  handleClickSave: (event: React.MouseEvent<HTMLButtonElement>) => void;
  getClickHandlerForBoard: ({
    boardIndex,
  }: {
    boardIndex: number;
  }) => () => void;
  handleClickOutOfSaveFlyout: () => void;
};

const AUTHOR_PROFILE_PICTURE_SIZE_PX = 32;

const PinThumbnail = ({
  pin,
  isInFirstColumn,
  isInLastColumn,
  boards,
  isImageHovered,
  isSaveFlyoutOpen,
  isSaving,
  indexBoardWhereJustSaved,
  handleMouseEnterImage,
  handleMouseLeaveImage,
  handleClickSave,
  getClickHandlerForBoard,
  handleClickOutOfSaveFlyout,
}: PinThumbnailProps) => {
  const { t } = useTranslation("PinsBoard");

  const hasSaved = indexBoardWhereJustSaved !== null;

  let imageOverlay;

  if (hasSaved) {
    const boardName = boards[indexBoardWhereJustSaved].name;

    const boardNameShort = ellipsizeText({
      text: boardName,
      maxLength: 20,
    });

    imageOverlay = (
      <div className={styles.hoverOverlay}>
        <div className={styles.hoverOverlayContentSaved}>
          <span className={styles.boardTitle}>{boardNameShort}</span>
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
            className={styles.saveButton}
            onClick={handleClickSave}
            data-testid="pin-thumbnail-save-button"
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
    <div className={styles.container} data-testid="pin-thumbnail">
      <Link
        to={`/pin/${pin.id}`}
        className={styles.imageContainer}
        onMouseEnter={handleMouseEnterImage}
        onMouseLeave={handleMouseLeaveImage}
        data-testid="pin-thumbnail-image"
      >
        {/* We don't use Next's Image component because we don't know the image's display height in advance. */}
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
      {pin.title && (
        <Link to={`/pin/${pin.id}`} className={styles.title}>
          {pin.title}
        </Link>
      )}
      <Link
        className={styles.authorDetails}
        data-testid="pin-author-details"
        to={`/${pin.author.username}`}
      >
        {pin.author.profilePictureURL && (
          <img
            className={styles.authorProfilePicture}
            width={AUTHOR_PROFILE_PICTURE_SIZE_PX}
            height={AUTHOR_PROFILE_PICTURE_SIZE_PX}
            src={pin.author.profilePictureURL}
            alt={`${t("ALT_PROFILE_PICTURE_OF")} ${pin.author.displayName}`}
          />
        )}
        <span className={styles.authorName}>{pin.author.displayName}</span>
      </Link>
      {isSaveFlyoutOpen && (
        <SavePinFlyoutContainer
          isInFirstColumn={isInFirstColumn}
          isInLastColumn={isInLastColumn}
          boards={boards}
          isSaving={isSaving}
          getClickHandlerForBoard={getClickHandlerForBoard}
          handleClickOutOfSaveFlyout={handleClickOutOfSaveFlyout}
        />
      )}
    </div>
  );
};

export default PinThumbnail;
