import { useMutation } from "@tanstack/react-query";
import { API_URL_CREATE_PIN, API_URL_PIN_IMAGE_UPLOAD_URL } from "../constants";
import { useFetchWithAuth } from "./useFetchWithAuth";
import { throwIfKO } from "../utils/fetch";

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

      // The API requires the dimensions. They let every client lay out the pin
      // before its image loads. 'createImageBitmap' rejects a file that the
      // browser cannot decode, so no pin is created for such a file.
      const bitmap = await createImageBitmap(pinImageFile);
      const imageWidth = bitmap.width;
      const imageHeight = bitmap.height;
      bitmap.close();

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
        body: JSON.stringify({
          title: pinDetails.title,
          description: pinDetails.description,
          image_file_key,
          image_width: imageWidth,
          image_height: imageHeight,
        }),
      });
      throwIfKO(createPinResponse);
      const responseData = await createPinResponse.json();

      return { pinId: responseData.unique_id as string };
    },
  });
};
