import { NavigationProp } from "@react-navigation/native";
import { useQuery } from "@tanstack/react-query";

import { PinNavigatorParamList } from "./PinNavigator";

import PinDetailsView from "@/src/components/PinDetailsView/PinDetailsView";
import { API_BASE_URL, API_ENDPOINT_PIN_DETAILS } from "@/src/lib/constants";
import { PinWithAuthorDetails } from "@/src/lib/types";
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

  // The query starts from the pin the previous screen already handed us, and
  // upgrades to the full details once they arrive.
  const pin = data ?? providedPin;

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
