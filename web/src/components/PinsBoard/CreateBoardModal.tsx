import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useCreateBoard } from "@/lib/hooks/useCreateBoard";
import { Board, PinWithAuthorDetails } from "@/lib/types/frontendTypes";
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
  const createBoardMutation = useCreateBoard();

  const [boardName, setBoardName] = useState("");

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setBoardName(event.target.value);
    createBoardMutation.reset();
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!boardName.trim()) return;

    createBoardMutation.mutate(
      { name: boardName.trim(), pinId: pin.id },
      { onSuccess },
    );
  };

  const errorMessage = createBoardMutation.isError
    ? t("CREATE_BOARD_ERROR_MESSAGE")
    : null;

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

  const isSubmitting = createBoardMutation.isPending;

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
