import { render } from "@testing-library/react-native";

import AccountDetailsView from "./AccountDetailsView";

import { API_ENDPOINT_ACCOUNT_DETAILS } from "@/src/lib/constants";
import { MOCK_API_RESPONSES_SERIALIZED } from "@/src/lib/testing-utils/mockAPIResponses";

const account = MOCK_API_RESPONSES_SERIALIZED[API_ENDPOINT_ACCOUNT_DETAILS];

const renderComponent = () => {
  render(
    <AccountDetailsView
      account={account}
      isLoading={false}
      handlePressBack={() => {}}
    />,
  );
};

// NB: this component is tested via src/navigators/HomeNavigator/AuthorScreen.test.tsx
it("renders", () => {
  renderComponent();
});
