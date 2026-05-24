import { useTranslation } from "react-i18next";
import OverlayModal from "@/components/OverlayModal/OverlayModal";
import styles from "./UnsavedChangesModal.module.css";

type UnsavedChangesModalProps = {
  onLeave: () => void;
  onStay: () => void;
};

const UnsavedChangesModal = ({ onLeave, onStay }: UnsavedChangesModalProps) => {
  const { t } = useTranslation("PinCreation");

  return (
    <OverlayModal onClose={onStay}>
      <div className={styles.content}>
        <h2 className={styles.title}>{t("UNSAVED_CHANGES_MODAL_TITLE")}</h2>
        <p className={styles.message}>{t("UNSAVED_CHANGES_MODAL_MESSAGE")}</p>
        <div className={styles.buttons}>
          <button
            className={styles.stayButton}
            onClick={onStay}
            data-testid="unsaved-changes-modal-stay-button"
          >
            {t("UNSAVED_CHANGES_MODAL_STAY")}
          </button>
          <button
            className={styles.leaveButton}
            onClick={onLeave}
            data-testid="unsaved-changes-modal-leave-button"
          >
            {t("UNSAVED_CHANGES_MODAL_LEAVE")}
          </button>
        </div>
      </div>
    </OverlayModal>
  );
};

export default UnsavedChangesModal;
