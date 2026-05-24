import { useState } from "react";
import { useTranslation } from "react-i18next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import styles from "./EditPinPanel.module.css";
import { PinWithFullDetails } from "@/lib/types/frontendTypes";
import { API_URL_UPDATE_PIN } from "@/lib/constants";
import { useFetchWithAuth } from "@/lib/hooks/useFetchWithAuth";
import { throwIfKO } from "@/lib/utils/fetch";

type EditPinPanelProps = {
  pin: PinWithFullDetails;
  onClose: () => void;
  onSave: (title: string | null, description: string | null) => void;
  onDelete: () => void;
};

const EditPinPanel = ({ pin, onClose, onSave, onDelete }: EditPinPanelProps) => {
  const { t } = useTranslation("CreatedPins");
  const fetchWithAuth = useFetchWithAuth();

  const [title, setTitle] = useState<string>(pin.title ?? "");
  const [description, setDescription] = useState<string>(pin.description ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const handleSave = async () => {
    setSaveError(false);
    setIsSaving(true);

    try {
      const url = `${API_URL_UPDATE_PIN}/${pin.id}/`;
      const response = await fetchWithAuth(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim() === "" ? null : title.trim(),
          description: description.trim() === "" ? null : description.trim(),
        }),
      });

      throwIfKO(response);
    } catch {
      setSaveError(true);
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
    onSave(
      title.trim() === "" ? null : title.trim(),
      description.trim() === "" ? null : description.trim(),
    );
    onClose();
  };

  const handleDelete = async () => {
    setDeleteError(false);
    setIsDeleting(true);

    try {
      const url = `${API_URL_UPDATE_PIN}/${pin.id}/`;
      const response = await fetchWithAuth(url, {
        method: "DELETE",
      });

      throwIfKO(response);
    } catch {
      setDeleteError(true);
      setIsDeleting(false);
      return;
    }

    setIsDeleting(false);
    onDelete();
    onClose();
  };

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
              onChange={(e) => setTitle(e.target.value)}
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
              onChange={(e) => setDescription(e.target.value)}
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
            <p className={styles.errorMessage} data-testid="edit-pin-delete-error">
              {t("EDIT_DELETE_ERROR")}
            </p>
          )}
        </div>
        <div className={styles.footer}>
          <button
            className={styles.deleteButton}
            onClick={handleDelete}
            disabled={isLoading}
            data-testid="edit-pin-delete-button"
          >
            {t("EDIT_DELETE_BUTTON")}
          </button>
          <button
            className={styles.saveButton}
            onClick={handleSave}
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
