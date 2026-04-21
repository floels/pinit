import { render, waitFor } from "@testing-library/react";
import AccountDetailsFetcher from "./AccountDetailsFetcher";
import {
  API_ROUTE_MY_ACCOUNT_DETAILS,
  PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY,
  USERNAME_LOCAL_STORAGE_KEY,
} from "@/lib/constants";
import { MockLocalStorage, withQueryClient } from "@/lib/testing-utils/misc";
import { AccountContext } from "@/contexts/accountContext";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_SERIALIZED,
} from "@/lib/testing-utils/mockAPIResponses";

const mockLogOut = jest.fn();

jest.mock("@/lib/hooks/useLogOut", () => ({
  useLogOut: () => mockLogOut,
}));

localStorage = new MockLocalStorage();

const mockSetAccount = jest.fn();

const renderComponent = () => {
  render(
    <AccountContext.Provider
      value={{ account: null, setAccount: mockSetAccount }}
    >
      {withQueryClient(<AccountDetailsFetcher />)};
    </AccountContext.Provider>,
  );
};

it(`calls 'setAccount' with proper arguments and persists 
relevant data upon successful fetch`, async () => {
  fetchMock.mockOnceIf(
    API_ROUTE_MY_ACCOUNT_DETAILS,
    MOCK_API_RESPONSES[API_ROUTE_MY_ACCOUNT_DETAILS],
  );

  renderComponent();

  const responseSerialized =
    MOCK_API_RESPONSES_SERIALIZED[API_ROUTE_MY_ACCOUNT_DETAILS];

  await waitFor(() => {
    expect(mockSetAccount).toHaveBeenCalledWith(responseSerialized);

    expect(localStorage.getItem(USERNAME_LOCAL_STORAGE_KEY)).toEqual(
      responseSerialized.username,
    );

    expect(localStorage.getItem(PROFILE_PICTURE_URL_LOCAL_STORAGE_KEY)).toEqual(
      responseSerialized.profilePictureURL,
    );
  });
});

it("triggers logout upon 401 response", async () => {
  fetchMock.mockOnceIf(API_ROUTE_MY_ACCOUNT_DETAILS, "{}", {
    status: 401,
  });

  renderComponent();

  await waitFor(() => {
    expect(mockLogOut).toHaveBeenCalledTimes(1);
  });
});
