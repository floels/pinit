import FontAwesome5Icon from "@expo/vector-icons/FontAwesome5";
import { View } from "react-native";

import styles from "./LoadingOverlay.styles";

import Spinner from "@/src/components/Spinner/Spinner";

const LoadingOverlay = () => {
  return (
    <View style={styles.container}>
      <Spinner>
        <FontAwesome5Icon name="spinner" size={40} style={styles.spinnerIcon} />
      </Spinner>
    </View>
  );
};

export default LoadingOverlay;
