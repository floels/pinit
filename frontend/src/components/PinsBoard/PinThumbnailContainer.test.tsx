import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PinThumbnailContainer from "./PinThumbnailContainer";
import { AccountContext, AccountContextType } from "@/contexts/accountContext";
import { AccountWithPrivateDetails } from "@/lib/types/frontendTypes";
import { useState } from "react";
import userEvent from "@testing-library/user-event";
import {
  API_URL_CREATE_BOARD,
  API_URL_MY_ACCOUNT_DETAILS,
  API_URL_PIN_SUGGESTIONS,
  API_URL_SAVE_PIN,
} from "@/lib/constants";
import en from "@/public/locales/en/PinsBoard.json";
import { ToastContainer } from "react-toastify";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_SERIALIZED,
} from "@/lib/testing-utils/mockAPIResponses";
import { withQueryClient } from "@/lib/testing-utils/misc";

const pin = MOCK_API_RESPONSES_SERIALIZED[API_URL_PIN_SUGGESTIONS].results[0];

const account = MOCK_API_RESPONSES_SERIALIZED[API_URL_MY_ACCOUNT_DETAILS];

const boards = account.boards;

const getThumbnail = () => screen.getByTestId("pin-thumbnail");

const clickSaveButton = async () => {
  fireEvent.mouseEnter(getThumbnail());

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
    withQueryClient(
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
    ),
  );
};

const StatefulWrapper = () => {
  const [currentAccount, setCurrentAccount] = useState<AccountWithPrivateDetails | null>(account);
  const accountContext: AccountContextType = { account: currentAccount, setAccount: setCurrentAccount };

  return (
    <MemoryRouter>
      <AccountContext.Provider value={accountContext}>
        <ToastContainer />
        <PinThumbnailContainer pin={pin} isInFirstColumn={false} isInLastColumn={false} />
      </AccountContext.Provider>
    </MemoryRouter>
  );
};

const renderComponentWithState = () => {
  render(withQueryClient(<StatefulWrapper />));
};

it("displays 'Save' button only upon hover", () => {
  renderComponent();

  const saveButton = screen.queryByTestId("pin-thumbnail-save-button");
  expect(saveButton).toBeNull();

  fireEvent.mouseEnter(getThumbnail());
  screen.getByTestId("pin-thumbnail-save-button");

  fireEvent.mouseLeave(getThumbnail());
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
    API_URL_SAVE_PIN,
    MOCK_API_RESPONSES[API_URL_SAVE_PIN],
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

  fetchMock.mockOnceIf(API_URL_SAVE_PIN, "{}", { status: 404 });

  await userEvent.click(firstBoardButton);

  await waitFor(() => {
    screen.getByText(en.PIN_SAVE_ERROR_MESSAGE);
  });
});

it("always displays the '...' more actions button", () => {
  renderComponent();

  screen.getByTestId("pin-thumbnail-more-actions-button");
});

it("hovering the below-image row triggers the thumbnail hover state", () => {
  renderComponent();

  expect(screen.queryByTestId("pin-thumbnail-save-button")).toBeNull();

  fireEvent.mouseEnter(getThumbnail());

  screen.getByTestId("pin-thumbnail-save-button");

  fireEvent.mouseLeave(getThumbnail());

  expect(screen.queryByTestId("pin-thumbnail-save-button")).toBeNull();
});

it("clicking '...' button opens dropdown with 'Download image' option", async () => {
  renderComponent();

  expect(screen.queryByTestId("pin-thumbnail-download-button")).toBeNull();

  await userEvent.click(screen.getByTestId("pin-thumbnail-more-actions-button"));

  screen.getByTestId("pin-thumbnail-download-button");
  screen.getByText(en.DOWNLOAD_IMAGE_BUTTON_TEXT);
});

it("clicking '...' button again closes the dropdown", async () => {
  renderComponent();

  await userEvent.click(screen.getByTestId("pin-thumbnail-more-actions-button"));
  screen.getByTestId("pin-thumbnail-download-button");

  await userEvent.click(screen.getByTestId("pin-thumbnail-more-actions-button"));
  expect(screen.queryByTestId("pin-thumbnail-download-button")).toBeNull();
});

it("clicking outside more actions dropdown closes it", async () => {
  renderComponent();

  await userEvent.click(screen.getByTestId("pin-thumbnail-more-actions-button"));
  screen.getByTestId("pin-thumbnail-download-button");

  await userEvent.click(document.body);

  expect(screen.queryByTestId("pin-thumbnail-download-button")).toBeNull();
});

it("pressing Escape closes more actions dropdown", async () => {
  renderComponent();

  await userEvent.click(screen.getByTestId("pin-thumbnail-more-actions-button"));
  screen.getByTestId("pin-thumbnail-download-button");

  await userEvent.keyboard("[Escape]");

  expect(screen.queryByTestId("pin-thumbnail-download-button")).toBeNull();
});

it("clicking 'Download image' closes the dropdown", async () => {
  renderComponent();

  await userEvent.click(screen.getByTestId("pin-thumbnail-more-actions-button"));

  fetchMock.mockOnceIf(pin.imageURL, "fake-image-data", {
    headers: { "Content-Type": "image/jpeg" },
  });
  global.URL.createObjectURL = jest.fn(() => "blob:fake-url");
  global.URL.revokeObjectURL = jest.fn();

  await userEvent.click(screen.getByTestId("pin-thumbnail-download-button"));

  expect(screen.queryByTestId("pin-thumbnail-download-button")).toBeNull();
});

it("displays 'Create board' button in flyout", async () => {
  renderComponent();

  await clickSaveButton();

  screen.getByTestId("save-pin-flyout-create-board-button");
  screen.getByText(en.CREATE_BOARD_BUTTON_TEXT);
});

it("clicking 'Create board' closes flyout and opens create board modal", async () => {
  renderComponent();

  await clickSaveButton();
  screen.getByTestId("save-pin-flyout-board-buttons");

  await userEvent.click(screen.getByTestId("save-pin-flyout-create-board-button"));

  expect(screen.queryByTestId("save-pin-flyout-board-buttons")).toBeNull();
  screen.getByTestId("create-board-modal");
});

it("closing create board modal dismisses it", async () => {
  renderComponent();

  await clickSaveButton();
  await userEvent.click(screen.getByTestId("save-pin-flyout-create-board-button"));
  screen.getByTestId("create-board-modal");

  await userEvent.click(screen.getByTestId("overlay-modal-close-button"));

  expect(screen.queryByTestId("create-board-modal")).toBeNull();
});

it("successfully creating a board shows success toast with view link", async () => {
  renderComponent();

  await clickSaveButton();
  await userEvent.click(screen.getByTestId("save-pin-flyout-create-board-button"));

  const nameInput = screen.getByTestId("create-board-name-input");
  await userEvent.type(nameInput, "New Board");

  fetchMock.mockOnceIf(
    API_URL_CREATE_BOARD,
    MOCK_API_RESPONSES[API_URL_CREATE_BOARD],
    { status: 201 },
  );

  await userEvent.click(screen.getByTestId("create-board-submit-button"));

  await waitFor(() => {
    expect(screen.queryByTestId("create-board-modal")).toBeNull();
    screen.getByTestId("board-created-toast-message");
    screen.getByTestId("board-created-toast-view-link");
  });
});

it("failed board creation shows error message in modal", async () => {
  renderComponent();

  await clickSaveButton();
  await userEvent.click(screen.getByTestId("save-pin-flyout-create-board-button"));

  const nameInput = screen.getByTestId("create-board-name-input");
  await userEvent.type(nameInput, "New Board");

  fetchMock.mockOnceIf(API_URL_CREATE_BOARD, "{}", { status: 409 });

  await userEvent.click(screen.getByTestId("create-board-submit-button"));

  await waitFor(() => {
    screen.getByTestId("create-board-error");
    screen.getByText(en.CREATE_BOARD_ERROR_MESSAGE);
  });
});

it("new board is added to the flyout board list after creation", async () => {
  renderComponentWithState();

  await clickSaveButton();
  await userEvent.click(screen.getByTestId("save-pin-flyout-create-board-button"));

  await userEvent.type(screen.getByTestId("create-board-name-input"), "New Board");

  fetchMock.mockOnceIf(
    API_URL_CREATE_BOARD,
    MOCK_API_RESPONSES[API_URL_CREATE_BOARD],
    { status: 201 },
  );

  await userEvent.click(screen.getByTestId("create-board-submit-button"));

  await waitFor(() => {
    expect(screen.queryByTestId("create-board-modal")).toBeNull();
  });

  await clickSaveButton();

  const boardButtonsContainer = screen.getByTestId("save-pin-flyout-board-buttons");
  const boardButtons = Array.from(boardButtonsContainer.childNodes);
  expect(boardButtons).toHaveLength(3);
});
