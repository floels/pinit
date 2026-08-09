import { NavigationProp } from "@react-navigation/native";
import { useState } from "react";

import BrowseMainNavigator from "./BrowseMainNavigator";
import { AuthenticatedNavigatorParamList } from "../AuthenticatedNavigator/AuthenticatedNavigator";

type BrowseMainNavigatorProps = {
  parentNavigation: NavigationProp<AuthenticatedNavigatorParamList>;
};

const BrowseMainNavigatorContainer = ({
  parentNavigation,
}: BrowseMainNavigatorProps) => {
  const [isCreateSelectModalVisible, setIsCreateSelectModalVisible] =
    useState(false);

  const createTabPressListener = (event: any) => {
    event?.preventDefault(); // prevent regular navigation to "Create" screen (which renders nothing)

    setIsCreateSelectModalVisible(true);
  };

  const handlePressCreatePin = () => {
    parentNavigation.navigate("Authenticated.Create");

    setIsCreateSelectModalVisible(false); // otherwise the modal will
    // still be visible on the "Create pin" screen
  };

  const handleCloseCreateSelectModal = () => {
    setIsCreateSelectModalVisible(false);
  };

  return (
    <BrowseMainNavigator
      isCreateSelectModalVisible={isCreateSelectModalVisible}
      handlePressCreatePin={handlePressCreatePin}
      handleCloseCreateSelectModal={handleCloseCreateSelectModal}
      createTabPressListener={createTabPressListener}
    />
  );
};

export default BrowseMainNavigatorContainer;
