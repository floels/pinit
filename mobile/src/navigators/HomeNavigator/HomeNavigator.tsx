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

const HomeNavigator = () => {
  const StackNavigator = createStackNavigator<HomeNavigatorParamList>();

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
