import { useRef, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTriangleExclamation,
  faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import styles from "./PinsBoard.module.css";
import { PinWithAuthorDetails } from "@/lib/types/frontendTypes";
import PinThumbnailsGrid from "../PinThumbnailsGrid/PinThumbnailsGrid";

type PinsBoardProps = {
  pins: PinWithAuthorDetails[];
  isFetching: boolean;
  fetchFailed: boolean;
  emptyResultsMessageKey?: string;
  onScrolledToBottom: () => void;
};

const PinsBoard = ({
  pins,
  isFetching,
  fetchFailed,
  emptyResultsMessageKey,
  onScrolledToBottom,
}: PinsBoardProps) => {
  const { t } = useTranslation("PinsBoard");

  const scrolledToBottomSentinel = useRef(null);

  const boardIsEmpty = pins.length === 0;

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        if (!boardIsEmpty) {
          // We only call 'onScrolledToBottom' if the board is not empty,
          // otherwise it gets called on the inital render.
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

  const shouldRenderEmptyResultsMessage =
    Boolean(emptyResultsMessageKey) &&
    !isFetching &&
    !fetchFailed &&
    pins.length === 0;

  return (
    <div className={styles.container}>
      <PinThumbnailsGrid pins={pins} />
      <div ref={scrolledToBottomSentinel} style={{ height: "1px" }} />
      {shouldRenderEmptyResultsMessage && (
        <div className={styles.errorMessage}>
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            size="xs"
            className={styles.errorMessageIcon}
          />
          {emptyResultsMessageKey && (() => {
            const [ns, ...rest] = emptyResultsMessageKey.split(".");
            return t(rest.join("."), { ns });
          })()}
        </div>
      )}
      {isFetching && (
        <div className={styles.loadingIconContainer}>
          <FontAwesomeIcon
            icon={faSpinner}
            size="2x"
            spin
            className={styles.loadingSpinner}
            data-testid="loading-spinner"
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
          {t("ERROR_DISPLAY_PINS")}
        </div>
      )}
    </div>
  );
};

export default PinsBoard;
