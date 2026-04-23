import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PinThumbnailContainer from "./PinThumbnailContainer";
import { AccountContext } from "@/contexts/accountContext";
import userEvent from "@testing-library/user-event";
import {
  API_ROUTE_MY_ACCOUNT_DETAILS,
  API_ROUTE_PIN_SUGGESTIONS,
  API_ROUTE_SAVE_PIN,
} from "@/lib/constants";
import en from "@/public/locales/en/PinsBoard.json";
import { ToastContainer } from "react-toastify";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_SERIALIZED,
} from "@/lib/testing-utils/mockAPIResponses";

const pin = MOCK_API_RESPONSES_SERIALIZED[API_ROUTE_PIN_SUGGESTIONS].results[0];

const account = MOCK_API_RESPONSES_SERIALIZED[API_ROUTE_MY_ACCOUNT_DETAILS];

const boards = account.boards;

const clickSaveButton = async () => {
  fireEvent.mouseEnter(screen.getByTestId("pin-thumbnail-image"));

  const saveButton = screen.getByTestId("pin-thumbnail-save-button");

  await userEvent.click(saveButton);
};

const getFirstBoardButton = () => {
  const boardButtonsContainer = screen.getByTestId(
    "save-pin-flyout-board-buttons",
  );

  return boardButtonsContainer.firstChild as HTMLButtonElement;
};

const renderComponent = () => {
  const accountContext = {
    account,
    setAccount: () => {},
  };

  render(
    <MemoryRouter>
      <AccountContext.Provider value={accountContext}>
        <ToastContainer />
        <PinThumbnailContainer
          pin={pin}
          isInFirstColumn={false}
          isInLastColumn={false}
        />
      </AccountContext.Provider>
    </MemoryRouter>,
  );
};

it("displays 'Save' button only upon hover", () => {
  renderComponent();

  const saveButton = screen.queryByTestId("pin-thumbnail-save-button");
  expect(saveButton).toBeNull();

  fireEvent.mouseEnter(screen.getByTestId("pin-thumbnail-image"));
  screen.getByTestId("pin-thumbnail-save-button");

  fireEvent.mouseLeave(screen.getByTestId("pin-thumbnail-image"));
  expect(screen.queryByTestId("pin-thumbnail-save-button")).toBeNull();
});

it("displays boards list in flyout when user clicks 'Save' button", async () => {
  renderComponent();

  await clickSaveButton();

  const boardButtonsContainer = screen.getByTestId(
    "save-pin-flyout-board-buttons",
  );

  const boardButtons = Array.from(boardButtonsContainer.childNodes);

  expect(boardButtons).toHaveLength(2);
});

it("closes 'Save' flyout when user clicks out", async () => {
  renderComponent();

  await clickSaveButton();

  screen.getByTestId("save-pin-flyout-board-buttons");

  await userEvent.click(document.body);

  expect(screen.queryByTestId("save-pin-flyout-board-buttons")).toBeNull();
});

it("closes 'Save' flyout when user hits 'Escape'", async () => {
  renderComponent();

  await clickSaveButton();

  screen.getByTestId("save-pin-flyout-board-buttons");

  await userEvent.keyboard("[Escape]");

  expect(screen.queryByTestId("save-pin-flyout-board-buttons")).toBeNull();
});

it("displays relevant data in board buttons", async () => {
  renderComponent();

  await clickSaveButton();

  const firstBoardButton = getFirstBoardButton();

  expect(firstBoardButton).toHaveTextContent(boards[0].name);

  const firstBoardThumbnail = within(firstBoardButton).getByRole("img");

  expect(firstBoardThumbnail.getAttribute("src")).toBe(boards[0].firstImageURLs[0]);
});

it("displays 'Save' button in board button only when hovered", async () => {
  renderComponent();

  await clickSaveButton();

  const firstBoardButton = getFirstBoardButton();

  expect(screen.queryByTestId("board-button-save-button")).toBeNull();

  fireEvent.mouseEnter(screen.getByText(boards[0].name));

  within(firstBoardButton).getByTestId("board-button-save-button");
});

it(`closes flyout and displays 'Saved' label with board title upon
successful save`, async () => {
  renderComponent();

  await clickSaveButton();

  const firstBoardButton = getFirstBoardButton();

  fetchMock.mockOnceIf(
    API_ROUTE_SAVE_PIN,
    MOCK_API_RESPONSES[API_ROUTE_SAVE_PIN],
  );

  await userEvent.click(firstBoardButton);

  await waitFor(() => {
    expect(screen.queryByTestId("save-pin-flyout-board-buttons")).toBeNull();

    screen.getByText(boards[0].name);

    screen.getByText(en.PIN_THUMBNAIL_SAVED_LABEL_TEXT);
  });
});

it("displays appropriate error toast upon KO response on saving pin", async () => {
  renderComponent();

  await clickSaveButton();

  const firstBoardButton = getFirstBoardButton();

  fetchMock.mockOnceIf(API_ROUTE_SAVE_PIN, "{}", { status: 404 });

  await userEvent.click(firstBoardButton);

  await waitFor(() => {
    screen.getByText(en.PIN_SAVE_ERROR_MESSAGE);
  });
});
