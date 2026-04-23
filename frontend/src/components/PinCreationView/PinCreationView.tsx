import { useTranslation } from "react-i18next";
import styles from "./PinCreationView.module.css";
import PinImageDropzone from "./PinImageDropzone";

type PinCreationViewProps = {
  hasDroppedFile: boolean;
  imagePreviewURL: string | null;
  pinDetails: { title: string; description: string };
  isPosting: boolean;
  handleFileDropped: (file: File) => void;
  handleClickDeleteImage: () => void;
  handleInputChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

const PinCreationView = ({
  hasDroppedFile,
  imagePreviewURL,
  pinDetails,
  isPosting,
  handleFileDropped,
  handleClickDeleteImage,
  handleInputChange,
  handleSubmit,
}: PinCreationViewProps) => {
  const { t } = useTranslation("PinCreation");

  return (
    <div className={styles.container}>
      {isPosting && (
        <div
          className={styles.loadingOverlay}
          data-testid="pin-creation-loading-overlay"
        />
      )}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.headerAndSubmitButton}>
          <h1 className={styles.header}>{t("CREATE_PIN")}</h1>
          {hasDroppedFile && (
            <button
              type="submit"
              disabled={!hasDroppedFile}
              className={styles.submitButton}
              data-testid="pin-creation-submit-button"
            >
              {isPosting ? t("PUBLISHING") : t("PUBLISH")}
            </button>
          )}
        </div>
        <div className={styles.formInputs}>
          <section>
            <PinImageDropzone
              imagePreviewURL={imagePreviewURL}
              onFileDropped={handleFileDropped}
              onClickDeleteImage={handleClickDeleteImage}
            />
          </section>
          <section className={styles.pinDetailsInputsContainer}>
            <div className={styles.titleLabelAndInput}>
              <label htmlFor="title" className={styles.label}>
                {t("LABEL_TITLE")}
              </label>
              <input
                type="text"
                name="title"
                value={pinDetails.title}
                placeholder={t("PLACEHOLDER_TITLE")}
                onChange={handleInputChange}
                disabled={!hasDroppedFile}
                className={styles.titleInput}
                data-testid="pin-creation-title-input"
              />
            </div>
            <div>
              <label htmlFor="description" className={styles.label}>
                {t("LABEL_DESCRIPTION")}
              </label>
              <textarea
                name="description"
                value={pinDetails.description}
                placeholder={t("PLACEHOLDER_DESCRIPTION")}
                onChange={handleInputChange}
                disabled={!hasDroppedFile}
                className={styles.descriptionTextArea}
                data-testid="pin-creation-description-textarea"
              />
            </div>
          </section>
        </div>
      </form>
    </div>
  );
};

export default PinCreationView;
