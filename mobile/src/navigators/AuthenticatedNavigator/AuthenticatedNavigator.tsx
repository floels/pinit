import { NavigatorScreenParams } from "@react-navigation/native";
import {
  createStackNavigator,
  TransitionPresets,
} from "@react-navigation/stack";

import BrowseNavigator, {
  BrowseNavigatorParamList,
} from "../BrowseNavigator/BrowseNavigator";

import CreateNavigator from "@/src/navigators/CreateNavigator/CreateNavigator";

export type AuthenticatedNavigatorParamList = {
  // 'NavigatorScreenParams' lets a caller target a screen of the nested
  // Browse navigator, which is how the pin creation toast opens the new pin.
  "Authenticated.Browse":
    NavigatorScreenParams<BrowseNavigatorParamList> | undefined;
  "Authenticated.Create": undefined;
};

const StackNavigator = createStackNavigator<AuthenticatedNavigatorParamList>();

const AuthenticatedNavigator = () => {
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
