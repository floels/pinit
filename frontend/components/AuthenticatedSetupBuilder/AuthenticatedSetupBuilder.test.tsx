import { withQueryClient } from "@/lib/testing-utils/misc";
import { render, waitFor } from "@testing-library/react";
import AuthenticatedSetupBuilder from "./AuthenticatedSetupBuilder";
import {
  API_ROUTE_MY_ACCOUNT_DETAILS,
  API_ROUTE_REFRESH_TOKEN,
} from "@/lib/constants";

const renderComponent = () => {
  render(withQueryClient(<AuthenticatedSetupBuilder />));
};

it(`refreshes access token if no expiration date in local storage,
and then fetches account details`, async () => {
  fetchMock.mockResolvedValueOnce(new Response());

  renderComponent();

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(API_ROUTE_REFRESH_TOKEN, {
      method: "POST",
    });
  });

  expect(fetch).toHaveBeenCalledTimes(1);

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(API_ROUTE_MY_ACCOUNT_DETAILS);
  });
});
