import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styles from "./PinThumbnail.module.css";
import {
  BoardWithBasicDetails,
  PinWithAuthorDetails,
} from "@/lib/types/frontendTypes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faDownload, faEllipsis, faPencil } from "@fortawesome/free-solid-svg-icons";
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
  isMoreActionsDropdownOpen: boolean;
  isOwnPin?: boolean;
  showMoreActions?: boolean;
  handleMouseEnterImage: () => void;
  handleMouseLeaveImage: () => void;
  handleClickSave: (event: React.MouseEvent<HTMLButtonElement>) => void;
  getClickHandlerForBoard: ({
    boardIndex,
  }: {
    boardIndex: number;
  }) => () => void;
  handleClickOutOfSaveFlyout: () => void;
  handleClickMoreActions: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleClickOutOfMoreActionsDropdown: () => void;
  handleDownloadImage: (event: React.MouseEvent<HTMLButtonElement>) => void;
  handleClickCreateBoard: () => void;
  handleClickEdit?: (event: React.MouseEvent<HTMLButtonElement>) => void;
};

const PinThumbnail = ({
  pin,
  isInFirstColumn,
  isInLastColumn,
  boards,
  isImageHovered,
  isSaveFlyoutOpen,
  isSaving,
  indexBoardWhereJustSaved,
  isMoreActionsDropdownOpen,
  isOwnPin,
  showMoreActions = true,
  handleMouseEnterImage,
  handleMouseLeaveImage,
  handleClickSave,
  getClickHandlerForBoard,
  handleClickOutOfSaveFlyout,
  handleClickMoreActions,
  handleClickOutOfMoreActionsDropdown,
  handleDownloadImage,
  handleClickCreateBoard,
  handleClickEdit,
}: PinThumbnailProps) => {
  const { t } = useTranslation("PinsBoard");

  const saveButtonRef = useRef<HTMLButtonElement>(null);
  const moreActionsWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMoreActionsDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        moreActionsWrapperRef.current &&
        !moreActionsWrapperRef.current.contains(event.target as Node)
      ) {
        handleClickOutOfMoreActionsDropdown();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMoreActionsDropdownOpen]);

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
            ref={saveButtonRef}
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

  const belowImageRowContent = isOwnPin ? (
    <button
      className={styles.moreActionsButton}
      onClick={handleClickEdit}
      data-testid="pin-thumbnail-edit-button"
    >
      <FontAwesomeIcon icon={faPencil} />
    </button>
  ) : showMoreActions ? (
    <div
      ref={moreActionsWrapperRef}
      className={`${styles.moreActionsButtonWrapper}${isMoreActionsDropdownOpen ? ` ${styles.dropdownOpen}` : ""}`}
    >
      <button
        className={styles.moreActionsButton}
        onClick={handleClickMoreActions}
        data-testid="pin-thumbnail-more-actions-button"
      >
        <FontAwesomeIcon icon={faEllipsis} />
      </button>
      <div className={styles.moreActionsTooltip}>
        {t("MORE_ACTIONS_TOOLTIP")}
      </div>
      {isMoreActionsDropdownOpen && (
        <div className={styles.moreActionsDropdown}>
          <button
            className={styles.moreActionsDropdownButton}
            onClick={handleDownloadImage}
            data-testid="pin-thumbnail-download-button"
          >
            <FontAwesomeIcon icon={faDownload} />
            {t("DOWNLOAD_IMAGE_BUTTON_TEXT")}
          </button>
        </div>
      )}
    </div>
  ) : null;

  return (
    <div
      className={`${styles.container}${isMoreActionsDropdownOpen ? ` ${styles.containerWithOpenDropdown}` : ""}`}
      onMouseEnter={handleMouseEnterImage}
      onMouseLeave={handleMouseLeaveImage}
      data-testid="pin-thumbnail"
    >
      <Link
        to={`/pin/${pin.id}`}
        className={styles.imageContainer}
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
        {pin.title && isOwnPin && (
          <span className={styles.pinTitle} data-testid="pin-thumbnail-title">
            {pin.title}
          </span>
        )}
        {belowImageRowContent}
      </div>
    </div>
  );
};

export default PinThumbnail;
