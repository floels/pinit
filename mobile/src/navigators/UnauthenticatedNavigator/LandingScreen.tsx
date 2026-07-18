import { NavigationProp } from "@react-navigation/native";
import { View } from "react-native";

import styles from "./LandingScreen.styles";

import LandingScreenContent from "@/src/components/LandingScreen/LandingScreenContent";
import LandingScreenGallery from "@/src/components/LandingScreen/LandingScreenGallery";
import LandingScreenGradient from "@/src/components/LandingScreen/LandingScreenGradient";
import { UnauthenticatedNavigatorParamList } from "@/src/navigators/UnauthenticatedNavigator/UnauthenticatedNavigator";

type LandingScreenProps = {
  navigation: NavigationProp<UnauthenticatedNavigatorParamList>;
};

const LandingScreen = ({ navigation }: LandingScreenProps) => {
  const handlePressLogIn = () => {
    navigation.navigate("Unauthenticated.Login");
  };

  return (
    <View style={styles.container}>
      <LandingScreenGallery />
      <LandingScreenGradient />
      <LandingScreenContent handlePressLogIn={handlePressLogIn} />
    </View>
  );
};

export default LandingScreen;
