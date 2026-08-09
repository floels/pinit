import { NavigationProp, useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";

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

  const { cameraRollPhotos, refusedCameraRollAccess } = useCameraRollPhotos();

  const handlePressNext = () => {
    const selectedPhoto = cameraRollPhotos[selectedImageIndex as number];

    navigation.navigate("EnterPinDetails", {
      selectedImageURI: selectedPhoto.uri,
      imageAspectRatio: selectedPhoto.width / selectedPhoto.height,
    });
  };

  const getPressHandlerForImage =
    ({ imageIndex }: { imageIndex: number }) =>
    () => {
      const isImageAlreadySelected = imageIndex === selectedImageIndex;

      setSelectedImageIndex(isImageAlreadySelected ? null : imageIndex);
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
