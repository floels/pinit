import { NavigationProp } from "@react-navigation/native";
import { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

import BrowseMainNavigator from "./BrowseMainNavigator";
import { AuthenticatedNavigatorParamList } from "../AuthenticatedNavigator/AuthenticatedNavigator";
import { BrowseNavigatorParamList } from "../BrowseNavigator/BrowseNavigator";

import { useAccountContext } from "@/src/contexts/accountContext";
import { Pin } from "@/src/lib/types";

type BrowseMainNavigatorProps = {
  createdPin: Pin | undefined;
  createdPinImageAspectRatio: number | undefined;
  navigation: NavigationProp<BrowseNavigatorParamList>;
  parentNavigation: NavigationProp<AuthenticatedNavigatorParamList>;
};

const BrowseMainNavigatorContainer = ({
  createdPin,
  createdPinImageAspectRatio,
  navigation,
  parentNavigation,
}: BrowseMainNavigatorProps) => {
  const { account } = useAccountContext();

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

  useEffect(() => {
    if (createdPin && createdPinImageAspectRatio) {
      showPinCreationToast();
    }
  }, [createdPin, createdPinImageAspectRatio]);

  const showPinCreationToast = () => {
    if (!createdPin || !account) {
      return;
    }

    const createdPinWithAuthorDetails = {
      ...createdPin,
      author: account,
    };

    const handlePressView = () => {
      navigation.navigate("Authenticated.Browse.CreatedPin", {
        pin: createdPinWithAuthorDetails,
        pinImageAspectRatio: createdPinImageAspectRatio as number,
      });
    };

    Toast.show({
      type: "pinCreationSuccess",
      position: "bottom",
      props: { handlePressView },
    });
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
