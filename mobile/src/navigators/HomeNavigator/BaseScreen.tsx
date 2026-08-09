import { NavigationProp } from "@react-navigation/native";
import { View } from "react-native";

import styles from "./BaseScreen.styles";

import PinsBoardContainer from "@/src/components/PinsBoard/PinsBoardContainer";
import { useMyAccountDetails } from "@/src/hooks/useMyAccountDetails";
import { useAPI } from "@/src/lib/api/useAPI";
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
  useMyAccountDetails();

  // The pin suggestions endpoint is 'IsAuthenticated', so the board carries the
  // access token.
  const { fetchAuthenticated } = useAPI();

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
      <PinsBoardContainer
        fetchEndpoint={pinSuggestionsEndpoint}
        fetchFn={fetchAuthenticated}
        getTapHandlerForPin={getTapHandlerForPin}
      />
    </View>
  );
};

export default BaseScreen;
