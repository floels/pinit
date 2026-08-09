import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import EditPinPanelContainer from "./EditPinPanelContainer";
import { AuthContext } from "@/contexts/authContext";
import { AccountContext } from "@/contexts/accountContext";
import { withQueryClient } from "@/lib/testing-utils/misc";
import { API_URL_UPDATE_PIN, API_URL_MY_ACCOUNT_DETAILS } from "@/lib/constants";
import en from "@/public/locales/en/CreatedPins.json";
import { MOCK_API_RESPONSES_SERIALIZED } from "@/lib/testing-utils/mockAPIResponses";

const account = MOCK_API_RESPONSES_SERIALIZED[API_URL_MY_ACCOUNT_DETAILS];

const authContext = {
  accessToken: "mock.access.token",
  setAccessToken: vi.fn(),
  isAuthInitialized: true,
};

const accountContext = {
  account,
  setAccount: () => {},
  isFetchError: false,
};

const testPin = {
  id: "000000000000000010",
  title: "Test Pin Title",
  description: "Test pin description",
  imageURL: "https://example.com/image.jpg",
  author: {
    username: "johndoe",
    displayName: "John Doe",
    initial: "J",
    profilePictureURL: null,
  },
};

const mockOnClose = vi.fn();
const mockOnSave = vi.fn();
const mockOnDelete = vi.fn();

const renderComponent = (pin = testPin) => {
  render(
    withQueryClient(
      <MemoryRouter>
        <AuthContext.Provider value={authContext}>
          <AccountContext.Provider value={accountContext}>
            <EditPinPanelContainer
              pin={pin}
              onClose={mockOnClose}
              onSave={mockOnSave}
              onDelete={mockOnDelete}
            />
          </AccountContext.Provider>
        </AuthContext.Provider>
      </MemoryRouter>,
    ),
  );
};

beforeEach(() => {
  vi.clearAllMocks();
});

it("renders with pin data pre-filled", () => {
  renderComponent();

  const titleInput = screen.getByTestId("edit-pin-title-input") as HTMLInputElement;
  const descriptionTextarea = screen.getByTestId("edit-pin-description-textarea") as HTMLTextAreaElement;

  expect(titleInput.value).toBe(testPin.title);
  expect(descriptionTextarea.value).toBe(testPin.description);

  screen.getByText(en.EDIT_PANEL_TITLE);
  screen.getByText(en.EDIT_SAVE_BUTTON);
  screen.getByText(en.EDIT_DELETE_BUTTON);
});

it("calls onClose when the X button is clicked", async () => {
  renderComponent();

  await userEvent.click(screen.getByTestId("edit-pin-panel-close-button"));

  await waitFor(() => expect(mockOnClose).toHaveBeenCalledTimes(1));
});

it("calls onClose when backdrop is clicked", async () => {
  renderComponent();

  await userEvent.click(screen.getByTestId("edit-pin-panel-backdrop"));

  await waitFor(() => expect(mockOnClose).toHaveBeenCalledTimes(1));
});

it("can submit title and description change via PATCH, then calls onSave callback", async () => {
  const updatePinUrl = `${API_URL_UPDATE_PIN}/${testPin.id}/`;

  fetchMock.mockOnceIf(updatePinUrl, "{}", { status: 200 });

  renderComponent();

  const titleInput = screen.getByTestId("edit-pin-title-input");
  await userEvent.clear(titleInput);
  await userEvent.type(titleInput, "Updated title");

  const descriptionTextarea = screen.getByTestId("edit-pin-description-textarea");
  await userEvent.clear(descriptionTextarea);
  await userEvent.type(descriptionTextarea, "Updated description");

  await userEvent.click(screen.getByTestId("edit-pin-save-button"));

  await waitFor(() => {
    expect(mockOnSave).toHaveBeenCalledWith("Updated title", "Updated description");
    expect(mockOnClose).toHaveBeenCalled();
  });
});

it("shows error message on failed PATCH", async () => {
  fetchMock.mockOnceIf(`${API_URL_UPDATE_PIN}/${testPin.id}/`, "{}", { status: 500 });

  renderComponent();

  await userEvent.click(screen.getByTestId("edit-pin-save-button"));

  await waitFor(() => {
    screen.getByTestId("edit-pin-save-error");
    screen.getByText(en.EDIT_SAVE_ERROR);
  });

  expect(mockOnSave).not.toHaveBeenCalled();
  expect(mockOnClose).not.toHaveBeenCalled();
});

it("calls onDelete and onClose after successful DELETE", async () => {
  fetchMock.mockOnceIf(`${API_URL_UPDATE_PIN}/${testPin.id}/`, "", { status: 204 });

  renderComponent();

  await userEvent.click(screen.getByTestId("edit-pin-delete-button"));

  await waitFor(() => {
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});

it("shows error message on failed DELETE", async () => {
  fetchMock.mockOnceIf(`${API_URL_UPDATE_PIN}/${testPin.id}/`, "{}", { status: 403 });

  renderComponent();

  await userEvent.click(screen.getByTestId("edit-pin-delete-button"));

  await waitFor(() => {
    screen.getByTestId("edit-pin-delete-error");
    screen.getByText(en.EDIT_DELETE_ERROR);
  });

  expect(mockOnDelete).not.toHaveBeenCalled();
});

it("sends PATCH request with auth token", async () => {
  fetchMock.mockOnceIf(`${API_URL_UPDATE_PIN}/${testPin.id}/`, "{}", { status: 200 });

  renderComponent();

  await userEvent.click(screen.getByTestId("edit-pin-save-button"));

  await waitFor(() => {
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_URL_UPDATE_PIN}/${testPin.id}/`,
      expect.objectContaining({
        method: "PATCH",
        headers: expect.objectContaining({
          Authorization: `Bearer ${authContext.accessToken}`,
        }),
      }),
    );
  });
});
