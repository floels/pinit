import { NavigationProp } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Toast from "react-native-toast-message";

import EnterPinDetailsScreenContainer from "./EnterPinDetailsScreenContainer";
import SelectPinImageScreenContainer from "./SelectPinImageScreenContainer";
import { AuthenticatedNavigatorParamList } from "../AuthenticatedNavigator/AuthenticatedNavigator";

import { useAccountContext } from "@/src/contexts/accountContext";
import { Pin } from "@/src/lib/types";

export type CreatePinNavigatorParamList = {
  SelectImage: undefined;
  EnterPinDetails: {
    selectedImageURI: string;
    providedImageAspectRatio: number | null;
  };
};

type CreateNavigatorProps = {
  navigation: NavigationProp<AuthenticatedNavigatorParamList>;
};

const StackNavigator = createStackNavigator<CreatePinNavigatorParamList>();

const CreateNavigator = (props: CreateNavigatorProps) => {
  const { account } = useAccountContext();

  // The toast belongs here, where the creation succeeds. The Browse tree used
  // to receive the created pin as a route parameter and react to it from an
  // Effect, which dropped the toast whenever the account had not loaded yet.
  const handleCreateSuccess = ({
    createdPin,
    createdPinImageAspectRatio,
  }: {
    createdPin: Pin;
    createdPinImageAspectRatio: number;
  }) => {
    props.navigation.navigate("Authenticated.Browse");

    // The pin details screen paints the author before it fetches the pin, so
    // the "View" shortcut needs the account. Without the account we still
    // report the success, and we leave the shortcut out.
    const handlePressView = account
      ? () => {
          props.navigation.navigate("Authenticated.Browse", {
            screen: "Authenticated.Browse.CreatedPin",
            params: {
              pin: { ...createdPin, author: account },
              pinImageAspectRatio: createdPinImageAspectRatio,
            },
          });
        }
      : undefined;

    Toast.show({
      type: "pinCreationSuccess",
      position: "bottom",
      props: { handlePressView },
    });
  };

  return (
    <StackNavigator.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <StackNavigator.Screen name="SelectImage">
        {({ navigation }) => (
          <SelectPinImageScreenContainer
            handlePressClose={props.navigation.goBack}
            navigation={navigation}
          />
        )}
      </StackNavigator.Screen>
      <StackNavigator.Screen name="EnterPinDetails">
        {({ navigation, route }) => (
          <EnterPinDetailsScreenContainer
            navigation={navigation}
            route={route}
            handleCreateSuccess={handleCreateSuccess}
          />
        )}
      </StackNavigator.Screen>
    </StackNavigator.Navigator>
  );
};

export default CreateNavigator;
