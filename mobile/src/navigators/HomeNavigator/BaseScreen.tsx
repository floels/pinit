import { NavigationProp } from "@react-navigation/native";
import { View } from "react-native";

import styles from "./BaseScreen.styles";

import AuthenticatedSetupBuilder from "@/src/components/AuthenticatedSetupBuilder/AuthenticatedSetupBuilder";
import PinsBoardContainer from "@/src/components/PinsBoard/PinsBoardContainer";
import {
  API_BASE_URL,
  API_ENDPOINT_PIN_SUGGESTIONS,
} from "@/src/lib/constants";
import { PinWithAuthorDetails } from "@/src/lib/types";
import { HomeNavigatorParamList } from "@/src/navigators/HomeNavigator/HomeNavigator";

type HomeScreenProps = {
  navigation: NavigationProp<HomeNavigatorParamList>;
};

const BaseScreen = ({ navigation }: HomeScreenProps) => {
  const getTapHandlerForPin =
    ({
      pin,
      pinImageAspectRatio,
    }: {
      pin: PinWithAuthorDetails;
      pinImageAspectRatio: number;
    }) =>
    () => {
      navigation.navigate("Authenticated.Browse.Main.Home.Pin", {
        pin,
        pinImageAspectRatio,
      });
    };

  const pinSuggestionsEndpoint = `${API_BASE_URL}/${API_ENDPOINT_PIN_SUGGESTIONS}`;

  return (
    <View style={styles.container}>
      <AuthenticatedSetupBuilder />
      <PinsBoardContainer
        fetchEndpoint={pinSuggestionsEndpoint}
        shouldAuthenticate
        getTapHandlerForPin={getTapHandlerForPin}
      />
    </View>
  );
};

export default BaseScreen;
