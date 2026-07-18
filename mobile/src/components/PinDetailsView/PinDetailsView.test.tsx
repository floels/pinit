import { render } from "@testing-library/react-native";

import PinDetailsView from "./PinDetailsView";

import { API_ENDPOINT_PIN_DETAILS } from "@/src/lib/constants";
import { MOCK_API_RESPONSES_SERIALIZED } from "@/src/lib/testing-utils/mockAPIResponses";

const pin = MOCK_API_RESPONSES_SERIALIZED[API_ENDPOINT_PIN_DETAILS];

const renderComponent = () => {
  render(
    <PinDetailsView
      pin={pin}
      pinImageAspectRatio={1.0}
      isLoading={false}
      handlePressAuthor={() => {}}
      handlePressBack={() => {}}
    />,
  );
};

// NB: this component is tested via src/navigators/HomeNavigator/HomeScreen.test.tsx
it("renders", () => {
  renderComponent();
});
