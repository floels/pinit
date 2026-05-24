import { useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import styles from "../PinsBoard/PinsBoard.module.css";
import { PinWithFullDetails } from "@/lib/types/frontendTypes";
import CreatedPinsGrid from "./CreatedPinsGrid";

type CreatedPinsBoardProps = {
  pins: PinWithFullDetails[];
  isFetching: boolean;
  fetchFailed: boolean;
  isOwnProfile: boolean;
  onScrolledToBottom: () => void;
  onPinDeleted: (pinId: string) => void;
  onPinUpdated: (
    pinId: string,
    title: string | null,
    description: string | null,
  ) => void;
};

const CreatedPinsBoard = ({
  pins,
  isFetching,
  fetchFailed,
  isOwnProfile,
  onScrolledToBottom,
  onPinDeleted,
  onPinUpdated,
}: CreatedPinsBoardProps) => {
  const { t } = useTranslation("CreatedPins");

  const scrolledToBottomSentinel = useRef(null);

  const boardIsEmpty = pins.length === 0;

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (!boardIsEmpty) {
          onScrolledToBottom();
        }
      }
    });

    if (scrolledToBottomSentinel.current) {
      observer.observe(scrolledToBottomSentinel.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [boardIsEmpty, onScrolledToBottom]);

  const shouldRenderEmptyMessage =
    !isFetching && !fetchFailed && pins.length === 0;

  return (
    <div className={styles.container}>
      <CreatedPinsGrid
        pins={pins}
        isOwnProfile={isOwnProfile}
        onPinDeleted={onPinDeleted}
        onPinUpdated={onPinUpdated}
      />
      <div ref={scrolledToBottomSentinel} style={{ height: "1px" }} />
      {shouldRenderEmptyMessage && (
        <div className={styles.errorMessage}>
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            size="xs"
            className={styles.errorMessageIcon}
          />
          {t("EMPTY_CREATED_PINS")}
        </div>
      )}
      {isFetching && (
        <div className={styles.loadingIconContainer}>
          <FontAwesomeIcon
            icon={faSpinner}
            size="2x"
            spin
            className={styles.loadingSpinner}
            data-testid="created-pins-loading-spinner"
          />
        </div>
      )}
      {fetchFailed && (
        <div className={styles.errorMessage}>
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            size="xs"
            className={styles.errorMessageIcon}
          />
          {t("ERROR_FETCH_CREATED_PINS")}
        </div>
      )}
    </div>
  );
};

export default CreatedPinsBoard;
