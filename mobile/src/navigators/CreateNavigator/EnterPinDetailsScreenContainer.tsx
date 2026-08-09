import { NavigationProp, RouteProp } from "@react-navigation/native";
import { File, UploadType } from "expo-file-system";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

import { CreatePinNavigatorParamList } from "./CreateNavigator";
import EnterPinDetailsScreen from "./EnterPinDetailsScreen";

import {
  API_BASE_URL,
  API_ENDPOINT_CREATE_PIN,
  API_ENDPOINT_PIN_IMAGE_UPLOAD_URL,
} from "@/src/lib/constants";
import { Pin } from "@/src/lib/types";
import { fetchWithAuthentication, throwIfKO } from "@/src/lib/utils/fetch";
import { serializePin } from "@/src/lib/utils/serializers";

type EnterPinDetailsScreenContainerProps = {
  navigation: NavigationProp<CreatePinNavigatorParamList>;
  route: RouteProp<CreatePinNavigatorParamList, "EnterPinDetails">;
  handleCreateSuccess: ({
    createdPin,
    createdPinImageAspectRatio,
  }: {
    createdPin: Pin;
    createdPinImageAspectRatio: number;
  }) => void;
};

const EnterPinDetailsScreenContainer = ({
  navigation,
  route,
  handleCreateSuccess,
}: EnterPinDetailsScreenContainerProps) => {
  const { t } = useTranslation();

  const { selectedImageURI, imageAspectRatio } = route.params;

  const [pinTitle, setPinTitle] = useState("");
  const [pinDescription, setPinDescription] = useState("");

  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = () => {
    uploadImageAndCreatePin();
  };

  const uploadImageAndCreatePin = async () => {
    setIsPosting(true);

    let createdPin;

    try {
      const uploadedImage = await uploadImageToS3();

      createdPin = await createPin(uploadedImage);
    } catch {
      handlePostError();
      return;
    } finally {
      setIsPosting(false);
    }

    // The created pin reports the dimensions of the image we uploaded, so we
    // derive the aspect ratio from the response rather than from the preview.
    handleCreateSuccess({
      createdPin,
      createdPinImageAspectRatio:
        createdPin.imageWidth / createdPin.imageHeight,
    });
  };

  // Pin images are uploaded straight to S3 through a presigned URL, then the
  // pin is created referencing the uploaded object by its key (mirrors the web
  // client). See backend `GetPinImageUploadUrlView` / `CreatePinView`.
  const uploadImageToS3 = async () => {
    // Normalize to JPEG so HEIC (the default iOS camera format) and other
    // formats upload as something the backend accepts (it only allows jpg/png).
    const jpegImage = await convertToJpeg(selectedImageURI);

    const uploadURLResponse = await fetchWithAuthentication(
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

  const convertToJpeg = async (uri: string) => {
    const context = ImageManipulator.manipulate(uri);
    const renderedImage = await context.renderAsync();

    // 'saveAsync' reports the dimensions of the JPEG we are about to upload, so
    // they describe the stored object exactly. We send them to the API, which
    // lets every client lay out the pin before its image loads.
    return renderedImage.saveAsync({ format: SaveFormat.JPEG });
  };

  const createPin = async ({
    imageFileKey,
    width,
    height,
  }: {
    imageFileKey: string;
    width: number;
    height: number;
  }) => {
    const response = await fetchWithAuthentication(
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

  const handlePostError = () => {
    Toast.show({
      type: "pinCreationError",
      position: "bottom",
      text1: t("CreatePin.CREATION_ERROR_MESSAGE"),
    });
  };

  return (
    <EnterPinDetailsScreen
      selectedImageURI={selectedImageURI}
      imageAspectRatio={imageAspectRatio}
      pinTitle={pinTitle}
      pinDescription={pinDescription}
      isPosting={isPosting}
      handlePressBack={navigation.goBack}
      handleChangePinTitle={setPinTitle}
      handleChangePinDescription={setPinDescription}
      handleSubmit={handleSubmit}
    />
  );
};

export default EnterPinDetailsScreenContainer;
