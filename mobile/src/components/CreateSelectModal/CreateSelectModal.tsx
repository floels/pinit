import { useTranslation } from "react-i18next";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

import styles from "./CreateSelectModal.styles";

type CreateSelectModalProps = {
  handlePressCreatePin: () => void;
  handleClose: () => void;
};

const CreateSelectModal = ({
  handlePressCreatePin,
  handleClose,
}: CreateSelectModalProps) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Modal
        animationType="slide"
        visible
        transparent
        onRequestClose={handleClose}
      >
        <View style={styles.modal}>
          <View style={styles.closeButtonAndTitle}>
            <TouchableOpacity
              onPress={handleClose}
              style={styles.closeButton}
              testID="create-select-modal-close-button"
            >
              <FontAwesome5Icon name="times" size={24} />
            </TouchableOpacity>
            <Text style={styles.title}>
              {t("TabsNavigationBar.CREATE_SELECT_MODAL_TITLE")}
            </Text>
          </View>
          <TouchableOpacity
            onPress={handlePressCreatePin}
            style={styles.createPinButton}
            testID="create-pin-button"
          >
            <View style={styles.createPinIconContainer}>
              <FontAwesome5Icon name="thumbtack" size={20} />
            </View>
            <Text>{t("TabsNavigationBar.CREATE_PIN_TITLE")}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

export default CreateSelectModal;
