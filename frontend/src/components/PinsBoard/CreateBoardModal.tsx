import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useFetchWithAuth } from "@/lib/hooks/useFetchWithAuth";
import { throwIfKO } from "@/lib/utils/fetch";
import { API_URL_CREATE_BOARD } from "@/lib/constants";
import { Board, PinWithAuthorDetails } from "@/lib/types/frontendTypes";
import { BoardFromAPI } from "@/lib/types/backendTypes";
import OverlayModal from "@/components/OverlayModal/OverlayModal";
import LabelledTextInput from "@/components/LabelledTextInput/LabelledTextInput";
import styles from "./CreateBoardModal.module.css";

type CreateBoardModalProps = {
  pin: PinWithAuthorDetails;
  onClose: () => void;
  onSuccess: (board: Board) => void;
};

const CreateBoardModal = ({ pin, onClose, onSuccess }: CreateBoardModalProps) => {
  const { t } = useTranslation("PinsBoard");
  const fetchWithAuth = useFetchWithAuth();

  const [boardName, setBoardName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBoardName(event.target.value);
    setErrorMessage(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!boardName.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    let responseData: BoardFromAPI;

    try {
      const response = await fetchWithAuth(API_URL_CREATE_BOARD, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: boardName.trim(), pin_id: pin.id }),
      });

      throwIfKO(response);

      responseData = await response.json();
    } catch {
      setErrorMessage(t("CREATE_BOARD_ERROR_MESSAGE"));
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(false);

    onSuccess({
      id: responseData.unique_id,
      name: responseData.name,
      slug: responseData.slug,
    });
  };

  const nameInput = (
    <div className={styles.inputWrapper}>
      <label htmlFor="boardName" className={styles.nameLabel}>
        {t("CREATE_BOARD_NAME_LABEL")}
      </label>
      <LabelledTextInput
        name="boardName"
        type="text"
        placeholder={t("CREATE_BOARD_NAME_PLACEHOLDER")}
        value={boardName}
        onChange={handleNameChange}
        autoComplete="off"
        data-testid="create-board-name-input"
      />
      {errorMessage && (
        <p className={styles.errorMessage} data-testid="create-board-error">
          {errorMessage}
        </p>
      )}
    </div>
  );

  const submitButtonText = isSubmitting
    ? t("CREATE_BOARD_SUBMITTING_BUTTON_TEXT")
    : t("CREATE_BOARD_SUBMIT_BUTTON_TEXT");

  const submitButton = (
    <div className={styles.footer}>
      <button
        type="submit"
        className={styles.submitButton}
        disabled={isSubmitting || !boardName.trim()}
        data-testid="create-board-submit-button"
      >
        {submitButtonText}
      </button>
    </div>
  );

  return (
    <OverlayModal onClose={onClose}>
      <div className={styles.container} data-testid="create-board-modal">
        <h2 className={styles.title}>{t("CREATE_BOARD_MODAL_TITLE")}</h2>
        <form onSubmit={handleSubmit} className={styles.form}>
          {nameInput}
          {submitButton}
        </form>
      </div>
    </OverlayModal>
  );
};

export default CreateBoardModal;
