import { NavigationProp, RouteProp } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { AuthenticatedNavigatorParamList } from "../AuthenticatedNavigator/AuthenticatedNavigator";

import { PinWithAuthorDetails } from "@/src/lib/types";
import BrowseMainNavigatorContainer from "@/src/navigators/BrowseMainNavigator/BrowseMainNavigatorContainer";
import PinNavigator from "@/src/navigators/PinNavigator/PinNavigator";

type BrowseNavigatorProps = {
  navigation: NavigationProp<AuthenticatedNavigatorParamList>;
  route: RouteProp<AuthenticatedNavigatorParamList, "Authenticated.Browse">;
};

export type BrowseNavigatorParamList = {
  "Authenticated.Browse.Main": undefined;
  "Authenticated.Browse.CreatedPin": {
    pin: PinWithAuthorDetails;
    pinImageAspectRatio: number;
  };
};

const BrowseNavigator = (props: BrowseNavigatorProps) => {
  const { createdPin, createdPinImageAspectRatio } = props.route.params || {}; // 'route.params'
  // is undefined, unless when we just created a pin.

  const StackNavigator = createStackNavigator<BrowseNavigatorParamList>();

  return (
    <StackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <StackNavigator.Screen name="Authenticated.Browse.Main">
        {({ navigation }) => (
          <BrowseMainNavigatorContainer
            createdPin={createdPin}
            createdPinImageAspectRatio={createdPinImageAspectRatio}
            navigation={navigation}
            parentNavigation={props.navigation}
          />
        )}
      </StackNavigator.Screen>
      <StackNavigator.Screen
        name="Authenticated.Browse.CreatedPin"
        component={PinNavigator}
      />
    </StackNavigator.Navigator>
  );
};

export default BrowseNavigator;
