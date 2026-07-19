import { createStackNavigator } from "@react-navigation/stack";

import PinNavigator from "../PinNavigator/PinNavigator";

import { PinWithAuthorDetails } from "@/src/lib/types";
import BaseScreen from "@/src/navigators/HomeNavigator/BaseScreen";

export type HomeNavigatorParamList = {
  "Authenticated.Browse.Main.Home.Base": undefined;
  "Authenticated.Browse.Main.Home.Pin": {
    pin: PinWithAuthorDetails;
    pinImageAspectRatio: number;
  };
};

// Created at module scope: creating the navigator inside the component body
// gives it a new component identity on every render, remounting the whole tree.
const StackNavigator = createStackNavigator<HomeNavigatorParamList>();

const HomeNavigator = () => {
  return (
    <StackNavigator.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <StackNavigator.Screen
        name="Authenticated.Browse.Main.Home.Base"
        component={BaseScreen}
      />
      <StackNavigator.Screen
        name="Authenticated.Browse.Main.Home.Pin"
        component={PinNavigator}
      />
    </StackNavigator.Navigator>
  );
};

export default HomeNavigator;
