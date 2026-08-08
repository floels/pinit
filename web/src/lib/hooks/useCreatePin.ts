import { useMutation } from "@tanstack/react-query";
import { API_URL_CREATE_PIN, API_URL_PIN_IMAGE_UPLOAD_URL } from "../constants";
import { useFetchWithAuth } from "./useFetchWithAuth";
import { throwIfKO } from "../utils/fetch";
import { readImageDimensions } from "../utils/images";

const MIME_TYPE_TO_EXTENSION: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
};

const MIME_TYPE_TO_CONTENT_TYPE: Record<string, string> = {
  "image/jpeg": "image/jpeg",
  "image/png": "image/png",
};

type CreatePinVariables = {
  pinImageFile: File;
  pinDetails: { title: string; description: string };
};

export const useCreatePin = () => {
  const fetchWithAuth = useFetchWithAuth();

  return useMutation({
    mutationFn: async ({ pinImageFile, pinDetails }: CreatePinVariables) => {
      const fileExtension = MIME_TYPE_TO_EXTENSION[pinImageFile.type];

      const imageDimensions = await readImageDimensions(pinImageFile);

      const presignedUrlResponse = await fetchWithAuth(
        `${API_URL_PIN_IMAGE_UPLOAD_URL}?file_extension=${fileExtension}`,
      );
      throwIfKO(presignedUrlResponse);
      const { upload_url, image_file_key } = await presignedUrlResponse.json();

      const s3Response = await fetch(upload_url, {
        method: "PUT",
        headers: { "Content-Type": MIME_TYPE_TO_CONTENT_TYPE[pinImageFile.type] },
        body: pinImageFile,
      });
      throwIfKO(s3Response);

      const createPinResponse = await fetchWithAuth(API_URL_CREATE_PIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // The API requires both dimensions together, or neither. So we omit
        // both when the browser could not decode the image.
        body: JSON.stringify({
          title: pinDetails.title,
          description: pinDetails.description,
          image_file_key,
          ...(imageDimensions && {
            image_width: imageDimensions.width,
            image_height: imageDimensions.height,
          }),
        }),
      });
      throwIfKO(createPinResponse);
      const responseData = await createPinResponse.json();

      return { pinId: responseData.unique_id as string };
    },
  });
};
