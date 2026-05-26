import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import boardStyles from "../PinsBoard/PinsBoard.module.css";
import styles from "./CreatedPins.module.css";
import { PinWithFullDetails } from "@/lib/types/frontendTypes";
import PinThumbnailContainer from "../PinsBoard/PinThumbnailContainer";

type CreatedPinsProps = {
  pins: PinWithFullDetails[];
  isFetching: boolean;
  fetchFailed: boolean;
  isOwnProfile: boolean;
  currentPage: number;
  hasNextPage: boolean;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onPinDeleted: (pinId: string) => void;
  onPinUpdated: (
    pinId: string,
    title: string | null,
    description: string | null,
  ) => void;
};

const CreatedPins = ({
  pins,
  isFetching,
  fetchFailed,
  isOwnProfile,
  currentPage,
  hasNextPage,
  onNextPage,
  onPreviousPage,
  onPinDeleted,
  onPinUpdated,
}: CreatedPinsProps) => {
  const { t } = useTranslation("CreatedPins");

  const shouldRenderEmptyMessage =
    !isFetching && !fetchFailed && pins.length === 0;

  const showPagination =
    !isFetching && !fetchFailed && (currentPage > 1 || hasNextPage);

  return (
    <div className={boardStyles.container}>
      <div className={styles.grid}>
        {pins.map((pin) => (
          <PinThumbnailContainer
            key={pin.id}
            pin={pin}
            isInFirstColumn={false}
            isInLastColumn={false}
            isOwnPin={isOwnProfile}
            showMoreActions={false}
            description={pin.description}
            onPinDeleted={onPinDeleted}
            onPinUpdated={onPinUpdated}
          />
        ))}
      </div>
      {shouldRenderEmptyMessage && (
        <div className={boardStyles.errorMessage}>
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            size="xs"
            className={boardStyles.errorMessageIcon}
          />
          {t("EMPTY_CREATED_PINS")}
        </div>
      )}
      {isFetching && (
        <div className={boardStyles.loadingIconContainer}>
          <FontAwesomeIcon
            icon={faSpinner}
            size="2x"
            spin
            className={boardStyles.loadingSpinner}
            data-testid="created-pins-loading-spinner"
          />
        </div>
      )}
      {fetchFailed && (
        <div className={boardStyles.errorMessage}>
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            size="xs"
            className={boardStyles.errorMessageIcon}
          />
          {t("ERROR_FETCH_CREATED_PINS")}
        </div>
      )}
      {showPagination && (
        <div className={styles.pagination}>
          <button
            className={styles.pageButton}
            onClick={onPreviousPage}
            disabled={currentPage === 1}
            data-testid="created-pins-previous-page"
          >
            {t("PAGINATION_PREVIOUS")}
          </button>
          <span
            className={styles.pageIndicator}
            data-testid="created-pins-page-indicator"
          >
            {currentPage}
          </span>
          <button
            className={styles.pageButton}
            onClick={onNextPage}
            disabled={!hasNextPage}
            data-testid="created-pins-next-page"
          >
            {t("PAGINATION_NEXT")}
          </button>
        </div>
      )}
    </div>
  );
};

export default CreatedPins;
