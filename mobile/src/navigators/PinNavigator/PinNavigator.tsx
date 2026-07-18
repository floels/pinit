import { RouteProp } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";

import AuthorScreen from "./AuthorScreen";
import HomeScreen from "./HomeScreen";
import { BrowseNavigatorParamList } from "../BrowseNavigator/BrowseNavigator";
import { HomeNavigatorParamList } from "../HomeNavigator/HomeNavigator";

import { Account, PinWithAuthorDetails } from "@/src/lib/types";
import { SearchNavigatorParamList } from "@/src/navigators/SearchNavigator/SearchNavigator";

type PinNavigatorProps = {
  route:
    | RouteProp<HomeNavigatorParamList, "Authenticated.Browse.Main.Home.Pin">
    | RouteProp<
        SearchNavigatorParamList,
        "Authenticated.Browse.Main.Search.Pin"
      >
    | RouteProp<BrowseNavigatorParamList, "Authenticated.Browse.CreatedPin">;
};

export type PinNavigatorParamList = {
  Home: {
    pin: PinWithAuthorDetails;
    pinImageAspectRatio: number;
  };
  Author: {
    author: Account;
  };
};

const PinNavigator = ({ route }: PinNavigatorProps) => {
  const { pin, pinImageAspectRatio } = route.params;

  const StackNavigator = createStackNavigator<PinNavigatorParamList>();

  return (
    <StackNavigator.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <StackNavigator.Screen name="Home">
        {({ navigation }) => (
          <HomeScreen
            pin={pin}
            pinImageAspectRatio={pinImageAspectRatio}
            navigation={navigation}
          />
        )}
      </StackNavigator.Screen>
      <StackNavigator.Screen name="Author" component={AuthorScreen} />
    </StackNavigator.Navigator>
  );
};

export default PinNavigator;
