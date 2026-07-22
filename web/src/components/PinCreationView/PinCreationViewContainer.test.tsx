import type { Mock } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router";
import PinCreationViewContainer from "./PinCreationViewContainer";
import en from "@/public/locales/en/PinCreation.json";
import { act } from "react";
import userEvent from "@testing-library/user-event";
import { API_URL_CREATE_PIN, API_URL_PIN_IMAGE_UPLOAD_URL } from "@/lib/constants";
import { FetchMock } from "jest-fetch-mock";
import { ToastContainer } from "react-toastify";
import { MOCK_API_RESPONSES } from "@/lib/testing-utils/mockAPIResponses";
import { withQueryClient } from "@/lib/testing-utils/misc";

vi.mock("react-router", async () => ({
  ...(await vi.importActual("react-router")),
  useBlocker: vi.fn(),
}));

import { useBlocker } from "react-router";

const mockImageFile = new File(["mockImage"], "MockImage.png", {
  type: "image/png",
});

const dropImageFile = async () => {
  const imageDropzone = screen.getByTestId("pin-image-dropzone");

  await act(async () => {
    await fireEvent.drop(imageDropzone, { target: { files: [mockImageFile] } });
  });
};

const expectInputFieldsToBeDisabled = () => {
  const titleInput = screen.getByTestId("pin-creation-title-input");
  expect(titleInput).toBeDisabled();

  const descriptionTextArea = screen.getByTestId(
    "pin-creation-description-textarea",
  );
  expect(descriptionTextArea).toBeDisabled();
};

const renderComponent = () => {
  render(
    withQueryClient(
      <MemoryRouter>
        <ToastContainer />
        <PinCreationViewContainer />
      </MemoryRouter>,
    ),
  );
};

const setupMocksForSuccessfulFlow = () => {
  fetchMock.mockOnce(MOCK_API_RESPONSES[API_URL_PIN_IMAGE_UPLOAD_URL], {
    status: 200,
  });
  fetchMock.mockOnce("ok", { status: 200 }); // S3 PUT
  fetchMock.mockOnce(MOCK_API_RESPONSES[API_URL_CREATE_PIN], { status: 201 });
};

const mockUseBlocker = useBlocker as Mock;

beforeEach(() => {
  fetchMock.resetMocks();
  mockUseBlocker.mockReturnValue({ state: "unblocked" });
});

it("renders header, have input fields disabled, and not render submit button initially", () => {
  renderComponent();

  screen.getByText(en.CREATE_PIN);

  expectInputFieldsToBeDisabled();

  expect(screen.queryByTestId("pin-creation-submit-button")).toBeNull();
});

it("renders image preview, have input fields enabled and render submit button upon file dropped", async () => {
  renderComponent();

  screen.getByText(en.DROPZONE_INSTRUCTION);

  await dropImageFile();

  await waitFor(() => {
    expect(screen.queryByText(en.DROPZONE_INSTRUCTION)).toBeNull();

    const pinImage = screen.getByRole("img") as HTMLImageElement;

    expect(pinImage.src).toMatch(/^data:image\/png;base64,/);

    const titleInput = screen.getByTestId("pin-creation-title-input");
    expect(titleInput).toBeEnabled();

    const descriptionTextArea = screen.getByTestId(
      "pin-creation-description-textarea",
    );
    expect(descriptionTextArea).toBeEnabled();

    screen.getByTestId("pin-creation-submit-button");
  });
});

it("renders dropzone again and hides submit button upon click on 'delete image'", async () => {
  renderComponent();

  await dropImageFile();

  await waitFor(async () => {
    const deleteButton = screen.getByTestId(
      "pin-image-dropzone-delete-image-button",
    ) as HTMLDivElement;

    await userEvent.click(deleteButton);

    screen.getByText(en.DROPZONE_INSTRUCTION);

    expect(screen.queryByTestId("pin-creation-submit-button")).toBeNull();
  });
});

it("makes correct API calls when user clicks submit", async () => {
  renderComponent();

  await dropImageFile();

  const titleInput = screen.getByTestId("pin-creation-title-input");
  await userEvent.type(titleInput, "Pin title");

  const descriptionTextArea = screen.getByTestId(
    "pin-creation-description-textarea",
  );
  await userEvent.type(descriptionTextArea, "Pin description");

  setupMocksForSuccessfulFlow();

  const submitButton = screen.getByTestId("pin-creation-submit-button");
  await userEvent.click(submitButton);

  await waitFor(() => {
    const mockedFetch = fetch as FetchMock;

    expect(mockedFetch).toHaveBeenCalledTimes(3);

    // Step 1: GET presigned upload URL
    const [presignedUrlCall, presignedUrlOptions] = mockedFetch.mock.calls[0];
    expect(String(presignedUrlCall)).toContain(API_URL_PIN_IMAGE_UPLOAD_URL);
    expect(String(presignedUrlCall)).toContain("file_extension=.png");
    expect(presignedUrlOptions?.headers).toMatchObject({
      Authorization: expect.stringContaining("Bearer"),
    });

    // Step 2: PUT image directly to S3
    const [, s3PutOptions] = mockedFetch.mock.calls[1];
    expect(s3PutOptions?.method).toBe("PUT");
    expect(s3PutOptions?.headers).toMatchObject({
      "Content-Type": "image/png",
    });
    expect(s3PutOptions?.body).toBe(mockImageFile);

    // Step 3: POST pin metadata to backend
    const [createPinUrl, createPinOptions] = mockedFetch.mock.calls[2];
    expect(createPinUrl).toBe(API_URL_CREATE_PIN);
    expect(createPinOptions?.method).toBe("POST");

    const body = JSON.parse(createPinOptions?.body as string);
    expect(body).toMatchObject({
      title: "Pin title",
      description: "Pin description",
      image_file_key:
        "pins/pin_image_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4.png",
    });
  });
});

it(`displays success toast with proper link and resets form
upon successful creation`, async () => {
  renderComponent();

  await dropImageFile();

  setupMocksForSuccessfulFlow();

  const submitButton = screen.getByTestId("pin-creation-submit-button");
  await userEvent.click(submitButton);

  await waitFor(() => {
    const successMessage = screen.getByTestId("success-toast-message");
    const pinLink = within(successMessage).getByRole(
      "link",
    ) as HTMLAnchorElement;
    expect(pinLink.href).toMatch(/\/pin\/000000000000000001$/);
  });

  // Check form was reset:
  await waitFor(() => screen.getByText(en.DROPZONE_INSTRUCTION));
  expectInputFieldsToBeDisabled();
  expect(screen.queryByTestId("pin-creation-submit-button")).toBeNull();
});

it("displays loading overlay and change text of submit button when posting", async () => {
  renderComponent();

  await dropImageFile();

  const submitButton = screen.getByTestId("pin-creation-submit-button");

  expect(submitButton).toHaveTextContent(en.PUBLISH);

  expect(screen.queryByTestId("pin-creation-loading-overlay")).toBeNull();

  const eternalPromise = new Promise<Response>(() => {});
  fetchMock.mockImplementationOnce(() => eternalPromise);

  await userEvent.click(submitButton);

  expect(submitButton).toHaveTextContent(en.PUBLISHING);

  screen.getByTestId("pin-creation-loading-overlay");
});

it("displays error toast in case of KO response upon posting", async () => {
  renderComponent();

  await dropImageFile();

  fetchMock.mockOnce("{}", { status: 400 });

  const submitButton = screen.getByTestId("pin-creation-submit-button");
  await userEvent.click(submitButton);

  screen.getByText(en.ERROR_POSTING_PIN);

  // Assert loading state was deactivated:
  expect(submitButton).toHaveTextContent(en.PUBLISH);
  expect(screen.queryByTestId("pin-creation-loading-overlay")).toBeNull();
});

it("does not show unsaved changes modal when blocker is unblocked", () => {
  mockUseBlocker.mockReturnValue({ state: "unblocked" });

  renderComponent();

  expect(screen.queryByTestId("overlay-modal")).toBeNull();
});

it("shows unsaved changes modal when navigation is blocked", () => {
  mockUseBlocker.mockReturnValue({
    state: "blocked",
    proceed: vi.fn(),
    reset: vi.fn(),
  });

  renderComponent();

  screen.getByText(en.UNSAVED_CHANGES_MODAL_TITLE);
  screen.getByText(en.UNSAVED_CHANGES_MODAL_MESSAGE);
  screen.getByTestId("unsaved-changes-modal-leave-button");
  screen.getByTestId("unsaved-changes-modal-stay-button");
});

it("calls blocker.proceed when clicking 'Leave' in unsaved changes modal", async () => {
  const mockProceed = vi.fn();

  mockUseBlocker.mockReturnValue({
    state: "blocked",
    proceed: mockProceed,
    reset: vi.fn(),
  });

  renderComponent();

  await userEvent.click(screen.getByTestId("unsaved-changes-modal-leave-button"));

  expect(mockProceed).toHaveBeenCalledTimes(1);
});

it("calls blocker.reset when clicking 'Stay' in unsaved changes modal", async () => {
  const mockReset = vi.fn();

  mockUseBlocker.mockReturnValue({
    state: "blocked",
    proceed: vi.fn(),
    reset: mockReset,
  });

  renderComponent();

  await userEvent.click(screen.getByTestId("unsaved-changes-modal-stay-button"));

  expect(mockReset).toHaveBeenCalledTimes(1);
});
