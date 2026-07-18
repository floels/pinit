import { NavigationProp } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { PinNavigatorParamList } from "./PinNavigator";

import PinDetailsView from "@/src/components/PinDetailsView/PinDetailsView";
import { API_BASE_URL, API_ENDPOINT_PIN_DETAILS } from "@/src/lib/constants";
import { PinWithAuthorDetails, PinWithFullDetails } from "@/src/lib/types";
import { throwIfKO } from "@/src/lib/utils/fetch";
import { serializePinWithFullDetails } from "@/src/lib/utils/serializers";

type HomeScreenProps = {
  pin: PinWithAuthorDetails;
  pinImageAspectRatio: number;
  navigation: NavigationProp<PinNavigatorParamList>;
};

const HomeScreen = ({
  pin: providedPin,
  pinImageAspectRatio,
  navigation,
}: HomeScreenProps) => {
  const [pin, setPin] = useState<PinWithFullDetails | PinWithAuthorDetails>(
    providedPin,
  );

  const { id } = providedPin;

  const fetchPinDetails = async () => {
    const url = `${API_BASE_URL}/${API_ENDPOINT_PIN_DETAILS}/${id}/`;

    const response = await fetch(url);

    throwIfKO(response);

    const responseData = await response.json();

    return serializePinWithFullDetails(responseData);
  };

  const { data, isLoading } = useQuery({
    queryKey: ["queryPinDetails", { id }],
    queryFn: fetchPinDetails,
  });

  useEffect(() => {
    if (data) {
      setPin(data);
    }
  }, [data]);

  const handlePressAuthor = () => {
    navigation.navigate("Author", {
      author: providedPin.author,
    });
  };

  return (
    <PinDetailsView
      pin={pin}
      pinImageAspectRatio={pinImageAspectRatio}
      isLoading={isLoading}
      handlePressBack={navigation.goBack}
      handlePressAuthor={handlePressAuthor}
    />
  );
};

export default HomeScreen;
