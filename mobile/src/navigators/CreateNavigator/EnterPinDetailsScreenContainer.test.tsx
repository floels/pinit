import {
  render,
  screen,
  userEvent,
  waitFor,
} from "@testing-library/react-native";
import { FetchMock } from "jest-fetch-mock";
import { Image } from "react-native";
import Toast from "react-native-toast-message";

import EnterPinDetailsScreenContainer from "./EnterPinDetailsScreenContainer";

import { API_BASE_URL, API_ENDPOINT_CREATE_PIN } from "@/src/lib/constants";
import { MockFormData, pressButton } from "@/src/lib/testing-utils/misc";
import {
  MOCK_API_RESPONSES,
  MOCK_API_RESPONSES_JSON,
} from "@/src/lib/testing-utils/mockAPIResponses";
import enTranslations from "@/translations/en.json";

jest.mock("expo-media-library", () => ({
  getAssetInfoAsync: () => ({
    localUri: "file:///my/image/path.jpeg",
  }),
}));

jest.mock("mime", () => ({
  getType: () => "image/jpeg",
}));

jest.mock("expo-secure-store", () => ({
  getItemAsync: () => "access_token",
}));

jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));

Image.getSize = jest.fn();

const mockNavigation = {
  goBack: jest.fn(),
} as any;

const mockHandleCreateSuccess = jest.fn();

const renderComponent = (
  { route }: any = {
    route: {
      params: { selectedImageURI: "ph://AAAA", providedImageAspectRatio: 1.5 },
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

const createPinEndpoint = `${API_BASE_URL}/${API_ENDPOINT_CREATE_PIN}`;

const typeInTitleInput = async (input: string) => {
  const titleInput = screen.getByTestId("pin-title-input");

  await userEvent.type(titleInput, input);
};

const typeInDescriptionInput = async (input: string) => {
  const descriptionInput = screen.getByTestId("pin-description-input");

  await userEvent.type(descriptionInput, input);
};

(global.FormData as any) = MockFormData;

beforeEach(() => {
  fetchMock.resetMocks();
});

it("calls 'fetch' with proper arguments upon pressing 'Create'", async () => {
  renderComponent();

  await typeInTitleInput("My pin title");
  await typeInDescriptionInput("My pin description");

  pressButton({ testID: "create-pin-submit-button" });

  await waitFor(() => {
    expect(fetch).toHaveBeenCalledWith(
      createPinEndpoint,
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer access_token",
        },
        body: expect.anything(),
      }),
    );

    const fetchCall = (fetch as FetchMock).mock.calls[0] as any;
    const formData = fetchCall[1].body;

    expect(formData.entries.title).toBe("My pin title");
    expect(formData.entries.description).toBe("My pin description");
    expect(formData.entries.image_file).toEqual({
      uri: "file:///my/image/path.jpeg",
      name: "image_file",
      type: "image/jpeg",
    });
  });
});

it("calls 'handleCreateSuccess' with proper arguments upon successful pin creation", async () => {
  renderComponent();

  fetchMock.mockOnceIf(
    createPinEndpoint,
    MOCK_API_RESPONSES[API_ENDPOINT_CREATE_PIN],
    {
      status: 201,
    },
  );

  pressButton({ testID: "create-pin-submit-button" });

  await waitFor(() => {
    expect(mockHandleCreateSuccess).toHaveBeenCalledWith({
      createdPin: {
        id: MOCK_API_RESPONSES_JSON[API_ENDPOINT_CREATE_PIN].unique_id,
        imageURL: MOCK_API_RESPONSES_JSON[API_ENDPOINT_CREATE_PIN].image_url,
        title: MOCK_API_RESPONSES_JSON[API_ENDPOINT_CREATE_PIN].title,
      },
      createdPinImageAspectRatio: 1.5,
    });
  });
});

it("displays error response toast upon KO response", async () => {
  renderComponent();

  fetchMock.mockOnceIf(createPinEndpoint, "{}", { status: 400 });

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

it("fetches image size itself if aspect ratio wasn't provided", async () => {
  const fetchedAspectRatio = 1.2;

  (Image.getSize as jest.Mock).mockImplementationOnce((_, success) => {
    success(100, 100 / fetchedAspectRatio);
  });

  renderComponent({
    route: {
      params: { selectedImageURI: "ph://AAAA", providedImageAspectRatio: null },
    },
  });

  fetchMock.mockOnceIf(
    createPinEndpoint,
    JSON.stringify(MOCK_API_RESPONSES[API_ENDPOINT_CREATE_PIN]),
    {
      status: 201,
    },
  );

  pressButton({ testID: "create-pin-submit-button" });

  await waitFor(() => {
    expect(mockHandleCreateSuccess).toHaveBeenCalledWith({
      createdPin: expect.anything(), // already tested above
      createdPinImageAspectRatio: fetchedAspectRatio,
    });
  });
});

it("does not fetch image size if aspect ratio was provided", async () => {
  (Image.getSize as jest.Mock).mockReset();

  renderComponent();

  expect(Image.getSize).not.toHaveBeenCalled();
});
