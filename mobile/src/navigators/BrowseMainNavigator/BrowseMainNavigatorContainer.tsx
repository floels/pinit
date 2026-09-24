import { NavigationProp } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import Toast from "react-native-toast-message";

import BrowseMainNavigator from "./BrowseMainNavigator";
import { AuthenticatedNavigatorParamList } from "../AuthenticatedNavigator/AuthenticatedNavigator";
import { BrowseNavigatorParamList } from "../BrowseNavigator/BrowseNavigator";

import { useMyAccountDetails } from "@/src/hooks/useMyAccountDetails";
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
  const { data: account } = useMyAccountDetails();
  // Toast only once per created pin: account may arrive after the pin params.
  const toastedPinIdRef = useRef<string | null>(null);

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
    if (!createdPin || !createdPinImageAspectRatio || !account) {
      return;
    }

    if (toastedPinIdRef.current === createdPin.id) {
      return;
    }

    toastedPinIdRef.current = createdPin.id;

    const createdPinWithAuthorDetails = {
      ...createdPin,
      author: account,
    };

    const handlePressView = () => {
      navigation.navigate("Authenticated.Browse.CreatedPin", {
        pin: createdPinWithAuthorDetails,
        pinImageAspectRatio: createdPinImageAspectRatio,
      });
    };

    Toast.show({
      type: "pinCreationSuccess",
      position: "bottom",
      // Long enough for the user (and E2E) to tap View before auto-hide.
      visibilityTime: 8000,
      props: { handlePressView },
    });
  }, [createdPin, createdPinImageAspectRatio, account, navigation]);

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
