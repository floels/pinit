import { createStackNavigator } from "@react-navigation/stack";

import HomeScreen from "./HomeScreen";
import ResultsScreenContainer from "./ResultsScreenContainer";
import PinNavigator from "../PinNavigator/PinNavigator";

import { PinWithAuthorDetails } from "@/src/lib/types";

export type SearchNavigatorParamList = {
  "Authenticated.Browse.Main.Search.Home": undefined;
  "Authenticated.Browse.Main.Search.Results": { searchTerm: string };
  "Authenticated.Browse.Main.Search.Pin": {
    pin: PinWithAuthorDetails;
    pinImageAspectRatio: number;
  };
};

const SearchNavigator = () => {
  const StackNavigator = createStackNavigator<SearchNavigatorParamList>();

  return (
    <StackNavigator.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <StackNavigator.Screen
        name="Authenticated.Browse.Main.Search.Home"
        component={HomeScreen}
      />
      <StackNavigator.Screen name="Authenticated.Browse.Main.Search.Results">
        {({ navigation, route }) => (
          <ResultsScreenContainer
            navigation={navigation}
            route={route}
            handlePressBack={navigation.goBack}
          />
        )}
      </StackNavigator.Screen>
      <StackNavigator.Screen
        name="Authenticated.Browse.Main.Search.Pin"
        component={PinNavigator}
      />
    </StackNavigator.Navigator>
  );
};

export default SearchNavigator;
