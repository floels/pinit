import { useTranslation } from "react-i18next";
import { View, Text, TouchableOpacity, Image, TextInput } from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

import styles from "./EnterPinDetailsScreen.styles";

import LoadingOverlay from "@/src/components/LoadingOverlay/LoadingOverlay";

type EnterPinDetailsScreenProps = {
  selectedImageURI: string;
  imageAspectRatio: number | null;
  pinTitle: string;
  pinDescription: string;
  isPosting: boolean;
  handleChangePinTitle: (title: string) => void;
  handleChangePinDescription: (description: string) => void;
  handlePressBack: () => void;
  handleSubmit: () => void;
};

const IMAGE_WIDTH = 100;

const EnterPinDetailsScreen = ({
  selectedImageURI,
  imageAspectRatio,
  pinTitle,
  pinDescription,
  isPosting,
  handlePressBack,
  handleChangePinTitle,
  handleChangePinDescription,
  handleSubmit,
}: EnterPinDetailsScreenProps) => {
  const { t } = useTranslation();

  const header = (
    <View style={styles.header}>
      <TouchableOpacity onPress={handlePressBack} style={styles.backButton}>
        <FontAwesome5Icon name="chevron-left" size={24} />
      </TouchableOpacity>
      <Text style={styles.title}>{t("CreatePin.CREATE_A_PIN")}</Text>
    </View>
  );

  if (imageAspectRatio === null) {
    // Display only the header while we are fetching the image's aspect ratio:
    return header;
  }

  const imageHeight = IMAGE_WIDTH / imageAspectRatio;

  return (
    <View style={styles.container}>
      {header}
      <Image
        source={{ uri: selectedImageURI }}
        style={styles.pinImage}
        width={IMAGE_WIDTH}
        height={imageHeight}
      />
      <View style={styles.pinTitleLabelAndInput}>
        <Text style={styles.formLabel}>{t("CreatePin.LABEL_PIN_TITLE")}</Text>
        <TextInput
          placeholder={t("CreatePin.PLACEHOLDER_PIN_TITLE")}
          onChangeText={handleChangePinTitle}
          value={pinTitle}
          style={styles.pinTitleInput}
          testID="pin-title-input"
        />
      </View>
      <View style={styles.pinDescriptionLabelAndInput}>
        <Text style={styles.formLabel}>
          {t("CreatePin.LABEL_PIN_DESCRIPTION")}
        </Text>
        <TextInput
          placeholder={t("CreatePin.PLACEHOLDER_PIN_DESCRIPTION")}
          onChangeText={handleChangePinDescription}
          value={pinDescription}
          testID="pin-description-input"
        />
      </View>
      <View style={styles.submitButtonContainer}>
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          testID="create-pin-submit-button"
        >
          <Text style={styles.submitButtonText}>
            {t("CreatePin.SUBMIT_BUTTON_TEXT")}
          </Text>
        </TouchableOpacity>
      </View>
      {isPosting && <LoadingOverlay />}
    </View>
  );
};

export default EnterPinDetailsScreen;
