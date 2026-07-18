import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { RouteProp } from "@react-navigation/native";
import FontAwesome5Icon from "react-native-vector-icons/FontAwesome5";

import ProfileRouteTabBarIcon from "./ProfileRouteTabBarIcon";

import CreateSelectModal from "@/src/components/CreateSelectModal/CreateSelectModal";
import ProfileScreen from "@/src/navigators/BrowseMainNavigator/ProfileScreen";
import HomeNavigator from "@/src/navigators/HomeNavigator/HomeNavigator";
import SearchNavigator from "@/src/navigators/SearchNavigator/SearchNavigator";

type BrowseMainNavigatorProps = {
  isCreateSelectModalVisible: boolean;
  handlePressCreatePin: () => void;
  handleCloseCreateSelectModal: () => void;
  createTabPressListener: (event: any) => void;
};

export type BrowseMainNavigatorParamList = {
  "Authenticated.Browse.Main.Home": undefined;
  "Authenticated.Browse.Main.Search": undefined;
  "Authenticated.Browse.Main.Create": undefined;
  "Authenticated.Browse.Main.Profile": undefined;
};

const TAB_BAR_ICON_NAMES: Record<string, string> = {
  "Authenticated.Browse.Main.Home": "home",
  "Authenticated.Browse.Main.Search": "search",
  "Authenticated.Browse.Main.Create": "plus",
};

const screenOptions = ({
  route,
}: {
  route: RouteProp<BrowseMainNavigatorParamList>;
}) => {
  let tabBarIcon;

  if (route.name === "Authenticated.Browse.Main.Profile") {
    tabBarIcon = ({ focused, color }: { focused: boolean; color: string }) => (
      <ProfileRouteTabBarIcon focused={focused} color={color} />
    );
  } else {
    tabBarIcon = ({ color }: { color: string }) => (
      <FontAwesome5Icon
        name={TAB_BAR_ICON_NAMES[route.name]}
        size={24}
        color={color}
        testID={
          route.name === "Authenticated.Browse.Main.Create"
            ? "tab-bar-icon-create"
            : ""
        }
      />
    );
  }

  return {
    tabBarIcon,
    tabBarShowLabel: false,
    headerShown: false,
    tabBarActiveTintColor: "black",
    tabBarInactiveTintColor: "gray",
  };
};

const BrowseMainNavigator = ({
  isCreateSelectModalVisible,
  handlePressCreatePin,
  handleCloseCreateSelectModal,
  createTabPressListener,
}: BrowseMainNavigatorProps) => {
  const TabNavigator = createBottomTabNavigator<BrowseMainNavigatorParamList>();

  return (
    <>
      <TabNavigator.Navigator screenOptions={screenOptions}>
        <TabNavigator.Screen
          name="Authenticated.Browse.Main.Home"
          component={HomeNavigator}
        />
        <TabNavigator.Screen
          name="Authenticated.Browse.Main.Search"
          component={SearchNavigator}
        />
        <TabNavigator.Screen
          name="Authenticated.Browse.Main.Create"
          listeners={{ tabPress: createTabPressListener }}
        >
          {() => null}
        </TabNavigator.Screen>
        <TabNavigator.Screen
          name="Authenticated.Browse.Main.Profile"
          component={ProfileScreen}
        />
      </TabNavigator.Navigator>
      {isCreateSelectModalVisible && (
        <CreateSelectModal
          handlePressCreatePin={handlePressCreatePin}
          handleClose={handleCloseCreateSelectModal}
        />
      )}
    </>
  );
};

export default BrowseMainNavigator;
