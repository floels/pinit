import { NavigationProp, RouteProp } from "@react-navigation/native";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

import { CreatePinNavigatorParamList } from "./CreateNavigator";
import EnterPinDetailsScreen from "./EnterPinDetailsScreen";

import { useCreatePinMutation } from "@/src/hooks/useCreatePinMutation";
import { Pin } from "@/src/lib/types";

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

  const { mutateAsync, isPending } = useCreatePinMutation();

  const handlePostError = () => {
    Toast.show({
      type: "pinCreationError",
      position: "bottom",
      text1: t("CreatePin.CREATION_ERROR_MESSAGE"),
    });
  };

  const handleSubmit = async () => {
    let createdPin;

    try {
      createdPin = await mutateAsync({
        selectedImageURI,
        pinTitle,
        pinDescription,
      });
    } catch {
      handlePostError();
      return;
    }

    // The created pin reports the dimensions of the image we uploaded, so we
    // derive the aspect ratio from the response rather than from the preview.
    handleCreateSuccess({
      createdPin,
      createdPinImageAspectRatio:
        createdPin.imageWidth / createdPin.imageHeight,
    });
  };

  return (
    <EnterPinDetailsScreen
      selectedImageURI={selectedImageURI}
      imageAspectRatio={imageAspectRatio}
      pinTitle={pinTitle}
      pinDescription={pinDescription}
      isPosting={isPending}
      handlePressBack={navigation.goBack}
      handleChangePinTitle={setPinTitle}
      handleChangePinDescription={setPinDescription}
      handleSubmit={handleSubmit}
    />
  );
};

export default EnterPinDetailsScreenContainer;
