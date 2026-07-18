import { createStackNavigator } from "@react-navigation/stack";

import LandingScreen from "@/src/navigators/UnauthenticatedNavigator/LandingScreen";
import LoginScreenContainer from "@/src/navigators/UnauthenticatedNavigator/LoginScreenContainer";

export type UnauthenticatedNavigatorParamList = {
  "Unauthenticated.Home": undefined;
  "Unauthenticated.Login": undefined;
};

const UnauthenticatedNavigator = () => {
  const StackNavigator = createStackNavigator();

  return (
    <StackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <StackNavigator.Screen
        name="Unauthenticated.Home"
        component={LandingScreen}
      />
      <StackNavigator.Screen
        name="Unauthenticated.Login"
        options={{ presentation: "modal" }}
        component={LoginScreenContainer}
      />
    </StackNavigator.Navigator>
  );
};

export default UnauthenticatedNavigator;
