import {
  render,
  screen,
  userEvent,
  waitFor,
} from "@testing-library/react-native";
import { File } from "expo-file-system";
import { Image } from "react-native";
import Toast from "react-native-toast-message";

import EnterPinDetailsScreenContainer from "./EnterPinDetailsScreenContainer";

import {
  API_BASE_URL,
  API_ENDPOINT_CREATE_PIN,
  API_ENDPOINT_PIN_IMAGE_UPLOAD_URL,
} from "@/src/lib/constants";
import { pressButton } from "@/src/lib/testing-utils/misc";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_JSON,
} from "@/src/lib/testing-utils/mockAPIResponses";
import enTranslations from "@/translations/en.json";

const mockUpload = jest.fn();

jest.mock("expo-file-system", () => ({
  File: jest.fn().mockImplementation(() => ({ upload: mockUpload })),
  UploadType: { BINARY_CONTENT: 0, MULTIPART: 1 },
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: () => "access_token",
}));

jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));

jest.mock("expo-image-manipulator", () => ({
  SaveFormat: { JPEG: "jpeg", PNG: "png", WEBP: "webp" },
  ImageManipulator: {
    manipulate: jest.fn(() => ({
      renderAsync: () =>
        Promise.resolve({
          saveAsync: () =>
            Promise.resolve({
              uri: "file:///converted/image.jpg",
              width: 1024,
              height: 768,
            }),
        }),
    })),
  },
}));

Image.getSize = jest.fn();

const MockFile = File as unknown as jest.Mock;

const MOCK_JPEG_URI = "file:///converted/image.jpg";
const MOCK_JPEG_WIDTH = 1024;
const MOCK_JPEG_HEIGHT = 768;

const uploadURLEndpoint = `${API_BASE_URL}/${API_ENDPOINT_PIN_IMAGE_UPLOAD_URL}`;
const createPinEndpoint = `${API_BASE_URL}/${API_ENDPOINT_CREATE_PIN}`;

const MOCK_UPLOAD_URL =
  "https://s3.example.test/pins/pin_image_abc.jpg?sig=xyz";
const MOCK_IMAGE_FILE_KEY = "pins/pin_image_abc.jpg";

const mockNavigation = {
  goBack: jest.fn(),
} as any;

const mockHandleCreateSuccess = jest.fn();

const renderComponent = (
  { route }: any = {
    route: {
      params: {
        selectedImageURI: "file:///my/image/path.jpeg",
        providedImageAspectRatio: 1.5,
      },
    },
  },
) => {
  render(
    <EnterPinDetailsScreenContainer
      navigation={mockNavigation}
      route={route}
      handleCreateSuccess={mockHandleCreateSuccess}
    />,
  );
};

// Queues the two backend responses the create flow expects: the presigned
// upload URL, then the pin-creation response.
const mockBackendResponses = ({ createInit = { status: 201 } } = {}) => {
  fetchMock.mockResponseOnce(
    JSON.stringify({
      upload_url: MOCK_UPLOAD_URL,
      image_file_key: MOCK_IMAGE_FILE_KEY,
    }),
  );
  fetchMock.mockResponseOnce(
    MOCK_API_RESPONSES[API_ENDPOINT_CREATE_PIN],
    createInit,
  );
};

const typeInTitleInput = async (input: string) => {
  const titleInput = screen.getByTestId("pin-title-input");

  await userEvent.type(titleInput, input);
};

const typeInDescriptionInput = async (input: string) => {
  const descriptionInput = screen.getByTestId("pin-description-input");

  await userEvent.type(descriptionInput, input);
};

beforeEach(() => {
  fetchMock.resetMocks();
  mockUpload.mockReset();
  mockUpload.mockResolvedValue({ status: 200, body: "", headers: {} });
  MockFile.mockClear();
});

it("uploads the image via a presigned URL then creates the pin", async () => {
  mockBackendResponses();

  renderComponent();

  await typeInTitleInput("My pin title");
  await typeInDescriptionInput("My pin description");

  pressButton({ testID: "create-pin-submit-button" });

  await waitFor(() => {
    // 1. Requests a presigned upload URL for the image's extension.
    expect(fetch).toHaveBeenNthCalledWith(
      1,
      `${uploadURLEndpoint}?file_extension=.jpg`,
      expect.objectContaining({
        headers: { Authorization: "Bearer access_token" },
      }),
    );

    // 2. Uploads the JPEG-converted file's bytes straight to S3.
    expect(MockFile).toHaveBeenCalledWith(MOCK_JPEG_URI);
    expect(mockUpload).toHaveBeenCalledWith(
      MOCK_UPLOAD_URL,
      expect.objectContaining({
        httpMethod: "PUT",
        headers: { "Content-Type": "image/jpeg" },
      }),
    );

    // 3. Creates the pin referencing the uploaded object by its key.
    expect(fetch).toHaveBeenNthCalledWith(
      2,
      createPinEndpoint,
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer access_token",
          "Content-Type": "application/json",
        },
        // The dimensions describe the JPEG we just uploaded, so every client
        // lays the pin out before its image loads.
        body: JSON.stringify({
          title: "My pin title",
          description: "My pin description",
          image_file_key: MOCK_IMAGE_FILE_KEY,
          image_width: MOCK_JPEG_WIDTH,
          image_height: MOCK_JPEG_HEIGHT,
        }),
      }),
    );
  });
});

it("calls 'handleCreateSuccess' with proper arguments upon successful pin creation", async () => {
  mockBackendResponses();

  renderComponent();

  pressButton({ testID: "create-pin-submit-button" });

  await waitFor(() => {
    expect(mockHandleCreateSuccess).toHaveBeenCalledWith({
      createdPin: {
        id: MOCK_API_RESPONSES_JSON[API_ENDPOINT_CREATE_PIN].unique_id,
        imageURL: MOCK_API_RESPONSES_JSON[API_ENDPOINT_CREATE_PIN].image_url,
        imageWidth:
          MOCK_API_RESPONSES_JSON[API_ENDPOINT_CREATE_PIN].image_width,
        imageHeight:
          MOCK_API_RESPONSES_JSON[API_ENDPOINT_CREATE_PIN].image_height,
        title: MOCK_API_RESPONSES_JSON[API_ENDPOINT_CREATE_PIN].title,
      },
      // Derived from the dimensions that the created pin reports:
      createdPinImageAspectRatio:
        MOCK_API_RESPONSES_JSON[API_ENDPOINT_CREATE_PIN].image_width /
        MOCK_API_RESPONSES_JSON[API_ENDPOINT_CREATE_PIN].image_height,
    });
  });
});

it("displays error response toast upon KO create response", async () => {
  mockBackendResponses({ createInit: { status: 400 } });

  renderComponent();

  pressButton({ testID: "create-pin-submit-button" });

  await waitFor(() => {
    expect(Toast.show).toHaveBeenLastCalledWith(
      expect.objectContaining({
        type: "pinCreationError",
        text1: enTranslations.CreatePin.CREATION_ERROR_MESSAGE,
      }),
    );
  });
});

it("displays error response toast when the S3 upload fails", async () => {
  mockBackendResponses();
  mockUpload.mockResolvedValue({ status: 403, body: "", headers: {} });

  renderComponent();

  pressButton({ testID: "create-pin-submit-button" });

  await waitFor(() => {
    expect(Toast.show).toHaveBeenLastCalledWith(
      expect.objectContaining({ type: "pinCreationError" }),
    );
  });
  // The pin must not be created if the image failed to upload.
  expect(fetch).not.toHaveBeenCalledWith(createPinEndpoint, expect.anything());
});

it("fetches image size itself if aspect ratio wasn't provided", async () => {
  // The fetched ratio sizes the preview of the selected image. The ratio of the
  // created pin comes from the API response instead, so it is not asserted here.
  const fetchedAspectRatio = 1.2;

  (Image.getSize as jest.Mock).mockImplementationOnce((_, success) => {
    success(100, 100 / fetchedAspectRatio);
  });

  renderComponent({
    route: {
      params: {
        selectedImageURI: "file:///my/image/path.jpeg",
        providedImageAspectRatio: null,
      },
    },
  });

  await waitFor(() => {
    expect(Image.getSize).toHaveBeenCalledWith(
      "file:///my/image/path.jpeg",
      expect.any(Function),
    );
  });
});

it("does not fetch image size if aspect ratio was provided", async () => {
  (Image.getSize as jest.Mock).mockReset();

  renderComponent();

  expect(Image.getSize).not.toHaveBeenCalled();
});
