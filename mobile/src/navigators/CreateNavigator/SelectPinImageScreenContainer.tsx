import { NavigationProp, useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Image } from "react-native";

import { CreatePinNavigatorParamList } from "./CreateNavigator";
import SelectPinImageScreen from "./SelectPinImageScreen";

import { useCameraRollPhotos } from "@/src/hooks/useCameraRollPhotos";

type SelectPinImageScreenContainerProps = {
  handlePressClose: () => void;
  navigation: NavigationProp<CreatePinNavigatorParamList>;
};

const SelectPinImageScreenContainer = ({
  handlePressClose,
  navigation,
}: SelectPinImageScreenContainerProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );

  // Un-select the image when user navigates back from "EnterPinDetailsScreen"
  // to this screen:
  useFocusEffect(
    useCallback(() => {
      setSelectedImageIndex(null);
    }, []),
  );

  const [selectedImageAspectRatio, setSelectedImageAspectRatio] = useState<
    number | null
  >(null);

  const { cameraRollPhotos, refusedCameraRollAccess } = useCameraRollPhotos();

  const handlePressNext = () => {
    navigation.navigate("EnterPinDetails", {
      selectedImageURI: cameraRollPhotos[selectedImageIndex as number].uri,
      providedImageAspectRatio: selectedImageAspectRatio,
    });
  };

  const getPressHandlerForImage =
    ({ imageIndex }: { imageIndex: number }) =>
    () => {
      const isImageAlreadySelected = imageIndex === selectedImageIndex;

      if (isImageAlreadySelected) {
        setSelectedImageIndex(null);
        setSelectedImageAspectRatio(null);
      } else {
        setSelectedImageIndex(imageIndex);
        Image.getSize(
          cameraRollPhotos[imageIndex].uri,
          (width: number, height: number) => {
            setSelectedImageAspectRatio(width / height);
          },
        );
      }
    };

  return (
    <SelectPinImageScreen
      refusedCameraRollAccess={refusedCameraRollAccess}
      cameraRollPhotos={cameraRollPhotos}
      selectedImageIndex={selectedImageIndex}
      getPressHandlerForImage={getPressHandlerForImage}
      handlePressClose={handlePressClose}
      handlePressNext={handlePressNext}
    />
  );
};

export default SelectPinImageScreenContainer;
