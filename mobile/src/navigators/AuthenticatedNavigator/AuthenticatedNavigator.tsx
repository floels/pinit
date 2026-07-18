import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";

import BrowseNavigator from "../BrowseNavigator/BrowseNavigator";

import { Pin } from "@/src/lib/types";
import CreateNavigator from "@/src/navigators/CreateNavigator/CreateNavigator";

export type AuthenticatedNavigatorParamList = {
  "Authenticated.Browse":
    | undefined
    | { createdPin: Pin; createdPinImageAspectRatio: number };
  "Authenticated.Create": undefined;
};

const AuthenticatedNavigator = () => {
  const StackNavigator =
    createStackNavigator<AuthenticatedNavigatorParamList>();

  return (
    <StackNavigator.Navigator
      screenOptions={{
        headerShown: false,
        ...TransitionPresets.ModalSlideFromBottomIOS,
      }}
    >
      <StackNavigator.Screen
        name="Authenticated.Browse"
        component={BrowseNavigator}
      />
      <StackNavigator.Screen
        name="Authenticated.Create"
        component={CreateNavigator}
      />
    </StackNavigator.Navigator>
  );
};

export default AuthenticatedNavigator;
