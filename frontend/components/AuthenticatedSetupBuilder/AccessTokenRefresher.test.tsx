import {
  ACCESS_TOKEN_EXPIRATION_DATE_LOCAL_STORAGE_KEY,
  API_ROUTE_REFRESH_TOKEN,
} from "@/lib/constants";
import { render, waitFor } from "@testing-library/react";
import AccessTokenRefresher, {
  TOKEN_REFRESH_BUFFER_BEFORE_EXPIRATION,
} from "./AccessTokenRefresher";
import { MockLocalStorage, withQueryClient } from "@/lib/testing-utils/misc";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_JSON,
} from "@/lib/testing-utils/mockAPIResponses";

jest.mock("js-cookie");

const mockHandleFinishedFetching = jest.fn();

const renderComponent = () => {
  render(
    withQueryClient(
      <AccessTokenRefresher
        handleFinishedFetching={mockHandleFinishedFetching}
      />,
    ),
  );
};

localStorage = new MockLocalStorage();

beforeEach(() => {
  fetchMock.resetMocks();

  mockHandleFinishedFetching.mockReset();

  localStorage.clear();
});

it(`does not refresh access token, and calls 'handleFinishedFetching'
if expiration date is beyond buffer`, () => {
  const nowTime = new Date().getTime();

  const accessTokenExpirationDate = new Date(
    nowTime + 2 * TOKEN_REFRESH_BUFFER_BEFORE_EXPIRATION,
  );

  localStorage.setItem(
    ACCESS_TOKEN_EXPIRATION_DATE_LOCAL_STORAGE_KEY,
    accessTokenExpirationDate.toISOString(),
  );

  renderComponent();

  expect(fetch).not.toHaveBeenCalled();

  expect(mockHandleFinishedFetching).toHaveBeenCalledTimes(1);
});

it(`refreshes access token, persists new expiration date
in local storage, and calls 'handleFinishedFetching' if no 
expiration date was found in local storage`, async () => {
  fetchMock.mockOnceIf(
    API_ROUTE_REFRESH_TOKEN,
    MOCK_API_RESPONSES[API_ROUTE_REFRESH_TOKEN],
  );

  renderComponent();

  await waitFor(() => {
    expect(
      localStorage.getItem(ACCESS_TOKEN_EXPIRATION_DATE_LOCAL_STORAGE_KEY),
    ).toEqual(
      MOCK_API_RESPONSES_JSON[API_ROUTE_REFRESH_TOKEN]
        .access_token_expiration_utc,
    );
  });

  expect(mockHandleFinishedFetching).toHaveBeenCalledTimes(1);
});

it("refreshes access token if invalid expiration date in local storage", () => {
  localStorage.setItem(
    ACCESS_TOKEN_EXPIRATION_DATE_LOCAL_STORAGE_KEY,
    "20-10-03",
  );

  renderComponent();

  expect(fetch).toHaveBeenCalledWith(
    API_ROUTE_REFRESH_TOKEN,
    expect.objectContaining({
      method: "POST",
    }),
  );
});

it("refreshes access token if expiration date in local storage is within buffer", () => {
  const nowTime = new Date().getTime();

  const accessTokenExpirationDate = new Date(
    nowTime + TOKEN_REFRESH_BUFFER_BEFORE_EXPIRATION / 2,
  );

  localStorage.setItem(
    ACCESS_TOKEN_EXPIRATION_DATE_LOCAL_STORAGE_KEY,
    accessTokenExpirationDate.toISOString(),
  );

  renderComponent();

  expect(fetch).toHaveBeenCalledWith(
    API_ROUTE_REFRESH_TOKEN,
    expect.objectContaining({
      method: "POST",
    }),
  );
});

it(`calls 'handleFinishedFetching' upon KO response
if no expiration date was found in local storage`, async () => {
  fetchMock.mockOnceIf(API_ROUTE_REFRESH_TOKEN, "{}", {
    status: 401,
  });

  renderComponent();

  await waitFor(() => {
    expect(mockHandleFinishedFetching).toHaveBeenCalledTimes(1);
  });
});
