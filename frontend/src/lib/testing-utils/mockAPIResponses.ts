import {
  API_URL_ACCOUNT_DETAILS,
  API_URL_BOARD_DETAILS,
  API_URL_CREATE_BOARD,
  API_URL_CREATE_PIN,
  API_URL_CREATED_PINS,
  API_URL_MY_ACCOUNT_DETAILS,
  API_URL_OBTAIN_TOKEN,
  API_URL_PIN_DETAILS,
  API_URL_PIN_IMAGE_UPLOAD_URL,
  API_URL_PIN_SUGGESTIONS,
  API_URL_REFRESH_TOKEN,
  API_URL_SEARCH,
  API_URL_SEARCH_SUGGESTIONS,
  API_URL_SIGN_UP,
  API_URL_UPDATE_PIN,
} from "../constants";

export const CREATED_PINS_URL = `${API_URL_CREATED_PINS}/johndoe/pins/`;
import { TypesOfAccount } from "../types/frontendTypes";

export const MOCK_API_RESPONSES_JSON = {
  [API_URL_SIGN_UP]: {
    access_token: "mock.access.token.signup",
    access_token_expiration_utc: "2024-02-07T07:09:45+00:00",
  },
  [API_URL_OBTAIN_TOKEN]: {
    access_token: "mock.access.token.login",
    access_token_expiration_utc: "2024-02-08T07:09:45+00:00",
  },
  [API_URL_REFRESH_TOKEN]: {
    access_token: "mock.access.token.refresh",
    access_token_expiration_utc: "2024-02-09T07:09:45+00:00",
  },
  [API_URL_PIN_SUGGESTIONS]: {
    results: Array.from({ length: 50 }, (_, index) => ({
      unique_id: String(index).padStart(18, "0"),
      image_url:
        "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
      title: `Pin ${index + 1} title`,
      author: {
        username: "johndoe",
        display_name: "John Doe",
        initial: "J",
        profile_picture_url:
          "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
      },
    })),
  },
  [API_URL_MY_ACCOUNT_DETAILS]: {
    username: "johndoe",
    display_name: "John Doe",
    profile_picture_url:
      "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
    boards: [
      {
        unique_id: "000000000000000001",
        name: "Board 1 name",
        slug: "board-1",
        first_image_urls: [
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
        ],
      },
      {
        unique_id: "000000000000000002",
        name: "Board 2 name",
        slug: "board-2",
        first_image_urls: [
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
        ],
      },
    ],
    initial: "J",
    background_picture_url:
      "https://i.pinimg.com/1200x/a9/b1/51/a9b151f4593e062c012579071aa09d16.jpg",
    description: null,
    type: "personal",
    owner_email: "john.doe@example.com",
  },
  [API_URL_SEARCH_SUGGESTIONS]: {
    results: [
      "foo suggestion 1",
      "foo suggestion 2",
      "foo suggestion 3",
      "foo suggestion 4",
      "foo suggestion 5",
      "foo suggestion 6",
    ],
  },
  [API_URL_PIN_IMAGE_UPLOAD_URL]: {
    upload_url:
      "https://fake-s3-bucket.s3.amazonaws.com/pins/pin_image_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4.png?X-Amz-Signature=fake",
    image_file_key: "pins/pin_image_a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4.png",
  },
  [API_URL_CREATE_PIN]: {
    unique_id: "000000000000000001",
    image_url:
      "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
    title: "Pin title",
  },
  [API_URL_CREATE_BOARD]: {
    unique_id: "000000000000000003",
    name: "New Board",
    slug: "new-board",
  },
  [API_URL_SEARCH]: {
    results: Array.from({ length: 50 }, (_, index) => ({
      unique_id: String(index).padStart(18, "0"),
      image_url:
        "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
      title: `Pin ${index + 1} title`,
      author: {
        username: "johndoe",
        display_name: "John Doe",
        profile_picture_url:
          "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
      },
    })),
  },
  [API_URL_PIN_DETAILS]: {
    unique_id: "000000000000000001",
    image_url:
      "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
    title: "Pin title",
    author: {
      username: "johndoe",
      display_name: "John Doe",
      initial: "J",
      profile_picture_url:
        "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
    },
    description: "Pin description.",
  },
  [API_URL_ACCOUNT_DETAILS]: {
    username: "johndoe",
    display_name: "John Doe",
    profile_picture_url:
      "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
    boards: [
      {
        unique_id: "000000000000000001",
        name: "Board 1 name",
        slug: "board-1",
        first_image_urls: [
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
        ],
      },
      {
        unique_id: "000000000000000002",
        name: "Board 2 name",
        slug: "board-2",
        first_image_urls: [
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
        ],
      },
    ],
    initial: "J",
    background_picture_url:
      "https://i.pinimg.com/1200x/a9/b1/51/a9b151f4593e062c012579071aa09d16.jpg",
    description: "Description for account of John Doe.",
  },
  [CREATED_PINS_URL]: {
    count: 5,
    next: null,
    previous: null,
    results: Array.from({ length: 5 }, (_, index) => ({
      unique_id: String(index + 10).padStart(18, "0"),
      image_url:
        "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
      title: `Created Pin ${index + 1} title`,
      description: `Created pin ${index + 1} description`,
      author: {
        username: "johndoe",
        display_name: "John Doe",
        initial: "J",
        profile_picture_url:
          "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
      },
    })),
  },
  [`${API_URL_UPDATE_PIN}/000000000000000010/`]: {
    unique_id: "000000000000000010",
    image_url:
      "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
    title: "Updated title",
    description: "Updated description",
    author: {
      username: "johndoe",
      display_name: "John Doe",
      initial: "J",
      profile_picture_url:
        "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
    },
  },
  [API_URL_BOARD_DETAILS]: {
    id: "000000000000000001",
    name: "Board 1 name",
    slug: "board-1",
    author: {
      username: "johndoe",
      display_name: "John Doe",
      initial: "J",
      profile_picture_url:
        "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
    },
    pins: [
      {
        unique_id: "000000000000000001",
        image_url:
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
        title: "Pin 1 title",
        author: {
          username: "johndoe",
          display_name: "John Doe",
          initial: "J",
          profile_picture_url:
            "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
        },
      },
      {
        unique_id: "000000000000000002",
        image_url:
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
        title: "Pin 2 title",
        author: {
          username: "johndoe",
          display_name: "John Doe",
          initial: "J",
          profile_picture_url:
            "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
        },
      },
    ],
  },
};

// NB: we don't use the serializers defined in
// 'lib/utils/serializers.ts' here because otherwise we wouldn't
// be able to detect in the tests if there is a bug in them.
export const MOCK_API_RESPONSES_SERIALIZED = {
  [API_URL_PIN_DETAILS]: {
    id: "000000000000000001",
    imageURL:
      "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
    title: "Pin title",
    author: {
      username: "johndoe",
      displayName: "John Doe",
      initial: "J",
      profilePictureURL:
        "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
    },
    description: "Pin description.",
  },
  [API_URL_ACCOUNT_DETAILS]: {
    username: "johndoe",
    displayName: "John Doe",
    profilePictureURL:
      "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
    boards: [
      {
        id: "000000000000000001",
        name: "Board 1 name",
        slug: "board-1",
        firstImageURLs: [
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
        ],
      },
      {
        id: "000000000000000002",
        name: "Board 2 name",
        slug: "board-2",
        firstImageURLs: [
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
        ],
      },
    ],
    initial: "J",
    backgroundPictureURL:
      "https://i.pinimg.com/1200x/a9/b1/51/a9b151f4593e062c012579071aa09d16.jpg",
    description: "Description for account of John Doe.",
  },
  [API_URL_MY_ACCOUNT_DETAILS]: {
    username: "johndoe",
    displayName: "John Doe",
    initial: "J",
    profilePictureURL:
      "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
    boards: [
      {
        id: "000000000000000001",
        name: "Board 1 name",
        slug: "board-1",
        firstImageURLs: [
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
        ],
      },
      {
        id: "000000000000000002",
        name: "Board 2 name",
        slug: "board-2",
        firstImageURLs: [
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
        ],
      },
    ],
    backgroundPictureURL:
      "https://i.pinimg.com/1200x/a9/b1/51/a9b151f4593e062c012579071aa09d16.jpg",
    description: null,
    type: TypesOfAccount.PERSONAL,
    ownerEmail: "john.doe@example.com",
  },
  [API_URL_PIN_SUGGESTIONS]: {
    results: Array.from({ length: 50 }, (_, index) => ({
      id: String(index).padStart(18, "0"),
      title: `Pin ${index} title`,
      imageURL:
        "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
      author: {
        username: "johndoe",
        displayName: "John Doe",
        initial: "J",
        profilePictureURL:
          "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
      },
    })),
  },
  [CREATED_PINS_URL]: {
    results: Array.from({ length: 5 }, (_, index) => ({
      id: String(index + 10).padStart(18, "0"),
      imageURL:
        "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
      title: `Created Pin ${index + 1} title`,
      description: `Created pin ${index + 1} description`,
      author: {
        username: "johndoe",
        displayName: "John Doe",
        initial: "J",
        profilePictureURL:
          "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
      },
    })),
  },
  [API_URL_BOARD_DETAILS]: {
    id: "000000000000000001",
    name: "Board 1 name",
    slug: "board-1",
    author: {
      username: "johndoe",
      displayName: "John Doe",
      initial: "J",
      profilePictureURL:
        "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
    },
    pins: [
      {
        id: "000000000000000001",
        imageURL:
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
        title: "Pin 1 title",
        author: {
          username: "johndoe",
          displayName: "John Doe",
          initial: "J",
          profilePictureURL:
            "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
        },
      },
      {
        id: "000000000000000002",
        imageURL:
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
        title: "Pin 2 title",
        author: {
          username: "johndoe",
          displayName: "John Doe",
          initial: "J",
          profilePictureURL:
            "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
        },
      },
    ],
  },
};

export const MOCK_API_RESPONSES = Object.fromEntries(
  Object.entries(MOCK_API_RESPONSES_JSON).map(([key, value]) => [
    key,
    JSON.stringify(value),
  ]),
);
