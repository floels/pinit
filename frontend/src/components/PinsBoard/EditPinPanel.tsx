import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import styles from "./EditPinPanel.module.css";

type EditPinPanelProps = {
  title: string;
  description: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  isSaving: boolean;
  isDeleting: boolean;
  saveError: boolean;
  deleteError: boolean;
  onSave: () => void;
  onDelete: () => void;
  onClose: () => void;
};

const EditPinPanel = ({
  title,
  description,
  onTitleChange,
  onDescriptionChange,
  isSaving,
  isDeleting,
  saveError,
  deleteError,
  onSave,
  onDelete,
  onClose,
}: EditPinPanelProps) => {
  const { t } = useTranslation("CreatedPins");

  const isLoading = isSaving || isDeleting;

  return (
    <>
      <div
        className={styles.backdrop}
        onClick={onClose}
        data-testid="edit-pin-panel-backdrop"
      />
      <div className={styles.panel} data-testid="edit-pin-panel">
        <div className={styles.header}>
          <h2 className={styles.title}>{t("EDIT_PANEL_TITLE")}</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            data-testid="edit-pin-panel-close-button"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className={styles.body}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="edit-pin-title">
              {t("EDIT_TITLE_LABEL")}
            </label>
            <input
              id="edit-pin-title"
              className={styles.input}
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder={t("EDIT_TITLE_PLACEHOLDER")}
              data-testid="edit-pin-title-input"
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="edit-pin-description">
              {t("EDIT_DESCRIPTION_LABEL")}
            </label>
            <textarea
              id="edit-pin-description"
              className={styles.textarea}
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder={t("EDIT_DESCRIPTION_PLACEHOLDER")}
              data-testid="edit-pin-description-textarea"
            />
          </div>
          {saveError && (
            <p className={styles.errorMessage} data-testid="edit-pin-save-error">
              {t("EDIT_SAVE_ERROR")}
            </p>
          )}
          {deleteError && (
            <p
              className={styles.errorMessage}
              data-testid="edit-pin-delete-error"
            >
              {t("EDIT_DELETE_ERROR")}
            </p>
          )}
        </div>
        <div className={styles.footer}>
          <button
            className={styles.deleteButton}
            onClick={onDelete}
            disabled={isLoading}
            data-testid="edit-pin-delete-button"
          >
            {t("EDIT_DELETE_BUTTON")}
          </button>
          <button
            className={styles.saveButton}
            onClick={onSave}
            disabled={isLoading}
            data-testid="edit-pin-save-button"
          >
            {t("EDIT_SAVE_BUTTON")}
          </button>
        </div>
      </div>
    </>
  );
};

export default EditPinPanel;
