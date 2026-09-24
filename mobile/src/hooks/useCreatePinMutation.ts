import { useMutation } from "@tanstack/react-query";
import { File, UploadType } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

import { useAPI } from "@/src/lib/api/useAPI";
import {
  API_BASE_URL,
  API_ENDPOINT_CREATE_PIN,
  API_ENDPOINT_PIN_IMAGE_UPLOAD_URL,
} from "@/src/lib/constants";
import { Pin } from "@/src/lib/types";
import { throwIfKO } from "@/src/lib/utils/fetch";
import { serializePin } from "@/src/lib/utils/serializers";

type CreatePinInput = {
  selectedImageURI: string;
  pinTitle: string;
  pinDescription: string;
};

type UploadedImage = {
  imageFileKey: string;
  width: number;
  height: number;
};

// Normalize to JPEG so HEIC (the default iOS camera format) and other formats
// upload as something the backend accepts (it only allows jpg/png).
const convertToJpeg = async (uri: string) => {
  const context = ImageManipulator.manipulate(uri);
  const renderedImage = await context.renderAsync();

  // 'saveAsync' reports the dimensions of the JPEG we are about to upload, so
  // they describe the stored object exactly. We send them to the API, which
  // lets every client lay out the pin before its image loads.
  return renderedImage.saveAsync({ format: SaveFormat.JPEG });
};

// Pin images are uploaded straight to S3 through a presigned URL, then the pin
// is created referencing the uploaded object by its key (mirrors the web
// client). See backend `GetPinImageUploadUrlView` / `CreatePinView`.
// Call sites own success/error UX. Intentionally does not invalidate or update
// pin-board queries after create (boards do not auto-refresh).
export const useCreatePinMutation = () => {
  const { fetchAuthenticated } = useAPI();

  const uploadImageToS3 = async (
    selectedImageURI: string,
  ): Promise<UploadedImage> => {
    const jpegImage = await convertToJpeg(selectedImageURI);

    const uploadURLResponse = await fetchAuthenticated(
      `${API_BASE_URL}/${API_ENDPOINT_PIN_IMAGE_UPLOAD_URL}?file_extension=.jpg`,
    );
    throwIfKO(uploadURLResponse);

    const { upload_url, image_file_key } = await uploadURLResponse.json();

    const uploadResult = await new File(jpegImage.uri).upload(upload_url, {
      httpMethod: "PUT",
      uploadType: UploadType.BINARY_CONTENT,
      headers: { "Content-Type": "image/jpeg" },
    });

    if (uploadResult.status < 200 || uploadResult.status >= 300) {
      throw new Error(`S3 upload failed with status ${uploadResult.status}`);
    }

    return {
      imageFileKey: image_file_key as string,
      width: jpegImage.width,
      height: jpegImage.height,
    };
  };

  const createPin = async ({
    imageFileKey,
    width,
    height,
    pinTitle,
    pinDescription,
  }: UploadedImage & {
    pinTitle: string;
    pinDescription: string;
  }): Promise<Pin> => {
    const response = await fetchAuthenticated(
      `${API_BASE_URL}/${API_ENDPOINT_CREATE_PIN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pinTitle,
          description: pinDescription,
          image_file_key: imageFileKey,
          image_width: width,
          image_height: height,
        }),
      },
    );

    throwIfKO(response);

    const responseData = await response.json();

    return serializePin(responseData);
  };

  return useMutation({
    mutationFn: async ({
      selectedImageURI,
      pinTitle,
      pinDescription,
    }: CreatePinInput): Promise<Pin> => {
      const uploadedImage = await uploadImageToS3(selectedImageURI);

      return createPin({
        ...uploadedImage,
        pinTitle,
        pinDescription,
      });
    },
  });
};
