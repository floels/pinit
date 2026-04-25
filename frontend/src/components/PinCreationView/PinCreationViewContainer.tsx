import { useTranslation } from "react-i18next";
import { useState } from "react";
import { API_URL_CREATE_PIN, API_URL_PIN_IMAGE_UPLOAD_URL } from "@/lib/constants";
import { useFetchWithAuth } from "@/lib/hooks/useFetchWithAuth";
import { toast } from "react-toastify";
import SuccessToastMessage from "./SuccessToastMessage";
import PinCreationView from "./PinCreationView";
import { throwIfKO } from "@/lib/utils/fetch";

const SUCCESS_TOAST_MIN_WIDTH = "380px";

const MIME_TYPE_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

const MIME_TYPE_TO_CONTENT_TYPE: Record<string, string> = {
  "image/jpeg": "image/jpeg",
  "image/png": "image/png",
};

const PinCreationViewContainer = () => {
  const { t } = useTranslation("PinCreation");
  const fetchWithAuth = useFetchWithAuth();

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

    createPinAndUpdateUI();
  };

  const createPinAndUpdateUI = async () => {
    setIsPosting(true);

    let responseData;

    try {
      responseData = await createPin();
    } catch {
      handleCreationError();
      return;
    } finally {
      setIsPosting(false);
    }

    handleCreationSuccess(responseData);
  };

  const createPin = async () => {
    const fileExtension = MIME_TYPE_TO_EXTENSION[pinImageFile!.type];

    const { uploadUrl, imageFileKey } = await fetchPresignedUploadUrl(fileExtension);

    await uploadImageToS3(uploadUrl, pinImageFile!.type);

    return await postPinDetails(imageFileKey);
  };

  const fetchPresignedUploadUrl = async (fileExtension: string) => {
    const url = `${API_URL_PIN_IMAGE_UPLOAD_URL}?file_extension=${fileExtension}`;
    const response = await fetchWithAuth(url);

    throwIfKO(response);

    const { upload_url, image_file_key } = await response.json();

    return { uploadUrl: upload_url as string, imageFileKey: image_file_key as string };
  };

  const uploadImageToS3 = async (uploadUrl: string, contentType: string) => {
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": MIME_TYPE_TO_CONTENT_TYPE[contentType] },
      body: pinImageFile,
    });

    throwIfKO(response);
  };

  const postPinDetails = async (imageFileKey: string) => {
    const response = await fetchWithAuth(API_URL_CREATE_PIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: pinDetails.title,
        description: pinDetails.description,
        image_file_key: imageFileKey,
      }),
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
