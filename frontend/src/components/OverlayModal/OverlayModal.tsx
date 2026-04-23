import { ReactNode, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import styles from "./OverlayModal.module.css";

type OverlayModalProps = {
  children: ReactNode;
  onClose: () => void;
};

const OverlayModal = ({ onClose, children }: OverlayModalProps) => {
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  const handleClickModal = (event: React.MouseEvent<HTMLDivElement>) => {
    // We need to stop the propagation of a click event on the modal itself,
    // otherwise it will trigger 'onClose':
    event.stopPropagation();
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div
      className={styles.overlay}
      data-testid="overlay-modal"
      onClick={onClose}
    >
      <div className={styles.modal} onClick={handleClickModal}>
        <div className={styles.closeButtonContainer}>
          <button
            className={styles.closeButton}
            onClick={onClose}
            data-testid="overlay-modal-close-button"
          >
            <FontAwesomeIcon icon={faXmark} size="2x" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default OverlayModal;
