import { NavigationProp } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import { AuthenticatedNavigatorParamList } from "../AuthenticatedNavigator/AuthenticatedNavigator";

import { PinWithAuthorDetails } from "@/src/lib/types";
import BrowseMainNavigatorContainer from "@/src/navigators/BrowseMainNavigator/BrowseMainNavigatorContainer";
import PinNavigator from "@/src/navigators/PinNavigator/PinNavigator";

type BrowseNavigatorProps = {
  navigation: NavigationProp<AuthenticatedNavigatorParamList>;
};

export type BrowseNavigatorParamList = {
  "Authenticated.Browse.Main": undefined;
  "Authenticated.Browse.CreatedPin": {
    pin: PinWithAuthorDetails;
    pinImageAspectRatio: number;
  };
};

const StackNavigator = createStackNavigator<BrowseNavigatorParamList>();

const BrowseNavigator = (props: BrowseNavigatorProps) => {
  return (
    <StackNavigator.Navigator screenOptions={{ headerShown: false }}>
      <StackNavigator.Screen name="Authenticated.Browse.Main">
        {() => (
          <BrowseMainNavigatorContainer parentNavigation={props.navigation} />
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
