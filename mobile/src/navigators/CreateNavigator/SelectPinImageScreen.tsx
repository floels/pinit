import { Asset } from "expo-media-library";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, View, Text } from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

import styles from "./SelectPinImageScreen.styles";

import CameraRollView from "@/src/components/SelectPinImageScreen/CameraRollView";

type SelectPinImageScreenProps = {
  refusedCameraRollAccess: boolean;
  cameraRollPhotos: Asset[];
  selectedImageIndex: number | null;
  getPressHandlerForImage: ({
    imageIndex,
  }: {
    imageIndex: number;
  }) => () => void;
  handlePressClose: () => void;
  handlePressNext: () => void;
};

const SelectPinImageScreen = ({
  refusedCameraRollAccess,
  cameraRollPhotos,
  selectedImageIndex,
  getPressHandlerForImage,
  handlePressClose,
  handlePressNext,
}: SelectPinImageScreenProps) => {
  const { t } = useTranslation();

  let displayCameraRoll;

  if (refusedCameraRollAccess) {
    displayCameraRoll = (
      <View>
        <FontAwesome5Icon name="exclamation-circle" size={24} />
        <Text>{t("CreatePin.CAMERA_ROLL_ACCESS_REQUIRED")}</Text>
      </View>
    );
  } else {
    displayCameraRoll = (
      <CameraRollView
        cameraRollPhotos={cameraRollPhotos}
        selectedImageIndex={selectedImageIndex}
        getPressHandlerForImage={getPressHandlerForImage}
      />
    );
  }

  const shouldShowNextButton = selectedImageIndex !== null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handlePressClose}
          style={styles.closeButton}
          testID="select-pin-image-screen-close-button"
        >
          <FontAwesome5Icon name="times" size={24} />
        </TouchableOpacity>
        {shouldShowNextButton && (
          <TouchableOpacity
            onPress={handlePressNext}
            style={styles.nextButton}
            testID="select-pin-image-screen-next-button"
          >
            <Text style={styles.nextButtonText}>{t("CreatePin.NEXT")}</Text>
          </TouchableOpacity>
        )}
      </View>
      {displayCameraRoll}
    </View>
  );
};

export default SelectPinImageScreen;
