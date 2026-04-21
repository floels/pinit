"use client";

import { useTranslation } from "react-i18next";
import { useState } from "react";
import { API_ROUTE_CREATE_PIN } from "@/lib/constants";
import { toast } from "react-toastify";
import SuccessToastMessage from "./SuccessToastMessage";
import PinCreationView from "./PinCreationView";
import { throwIfKO } from "@/lib/utils/fetch";

const SUCCESS_TOAST_MIN_WIDTH = "380px";

const PinCreationViewContainer = () => {
  const { t } = useTranslation("PinCreation");

  const [pinImageFile, setPinImageFile] = useState<File | null>(null);
  const [imagePreviewURL, setImagePreviewURL] = useState<string | null>(null);
  const [pinDetails, setPinDetails] = useState({ title: "", description: "" });
  const [isPosting, setIsPosting] = useState(false);

  const hasDroppedFile = Boolean(pinImageFile);

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

    const formData = buildFormData();

    postFormDataAndUpdateUI(formData);
  };

  const buildFormData = () => {
    const formData = new FormData();

    if (pinImageFile) {
      formData.append("image_file", pinImageFile);
    }

    formData.append("title", pinDetails.title);
    formData.append("description", pinDetails.description);

    return formData;
  };

  const postFormDataAndUpdateUI = async (formData: FormData) => {
    setIsPosting(true);

    let responseData;

    try {
      responseData = await postFormData(formData);
    } catch {
      handleCreationError();
      return;
    } finally {
      setIsPosting(false);
    }

    handleCreationSuccess(responseData);
  };

  const postFormData = async (formData: FormData) => {
    const response = await fetch(API_ROUTE_CREATE_PIN, {
      method: "POST",
      body: formData,
    });

    throwIfKO(response);

    const responseData = await response.json();

    return { pinId: responseData.unique_id };
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

  return (
    <PinCreationView
      hasDroppedFile={hasDroppedFile}
      imagePreviewURL={imagePreviewURL}
      pinDetails={pinDetails}
      isPosting={isPosting}
      handleFileDropped={handleFileDropped}
      handleClickDeleteImage={handleClickDeleteImage}
      handleInputChange={handleInputChange}
      handleSubmit={handleSubmit}
    />
  );
};

export default PinCreationViewContainer;
