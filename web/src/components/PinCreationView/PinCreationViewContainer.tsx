import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useBlocker } from "react-router";
import { useCreatePin } from "@/lib/hooks/useCreatePin";
import { toast } from "react-toastify";
import SuccessToastMessage from "./SuccessToastMessage";
import PinCreationView from "./PinCreationView";

const SUCCESS_TOAST_MIN_WIDTH = "380px";

const PinCreationViewContainer = () => {
  const { t } = useTranslation("PinCreation");
  const createPinMutation = useCreatePin();

  const [pinImageFile, setPinImageFile] = useState<File | null>(null);
  const [imagePreviewURL, setImagePreviewURL] = useState<string | null>(null);
  const [pinDetails, setPinDetails] = useState({ title: "", description: "" });

  const hasDroppedFile = Boolean(pinImageFile);

  const blocker = useBlocker(hasDroppedFile);

  const handleFileDropped = (file: File) => {
    setPinImageFile(file);

    const fileReader = new FileReader();

    fileReader.onload = () => {
      setImagePreviewURL(fileReader.result as string);
    };

    fileReader.readAsDataURL(file);
  };

  const handleClickDeleteImage = () => {
    setPinImageFile(null);

    setImagePreviewURL(null);
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    const newPinDetails = { ...pinDetails, [name]: value };
    setPinDetails(newPinDetails);
  };

  const resetForm = () => {
    setPinImageFile(null);
    setImagePreviewURL(null);
    setPinDetails({ title: "", description: "" });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    createPinMutation.mutate(
      { pinImageFile: pinImageFile!, pinDetails },
      {
        onSuccess: ({ pinId }) => handleCreationSuccess({ pinId }),
        onError: handleCreationError,
      },
    );
  };

  const handleCreationError = () => {
    toast.warn(t("ERROR_POSTING_PIN"), {
      toastId: "toast-pin-creation-error",
    });
  };

  const handleCreationSuccess = ({ pinId }: { pinId: string }) => {
    toast.success(() => <SuccessToastMessage pinId={pinId} />, {
      position: "bottom-center",
      toastId: "pin-creation-success",
      style: { minWidth: SUCCESS_TOAST_MIN_WIDTH },
    });

    resetForm();
  };

  const showUnsavedChangesModal = blocker.state === "blocked";
  const onConfirmLeave = blocker.proceed!;
  const onCancelLeave = blocker.reset!;

  return (
    <PinCreationView
      hasDroppedFile={hasDroppedFile}
      imagePreviewURL={imagePreviewURL}
      pinDetails={pinDetails}
      isPosting={createPinMutation.isPending}
      handleFileDropped={handleFileDropped}
      handleClickDeleteImage={handleClickDeleteImage}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
      showUnsavedChangesModal={showUnsavedChangesModal}
      onConfirmLeave={onConfirmLeave}
      onCancelLeave={onCancelLeave}
    />
  );
};

export default PinCreationViewContainer;
