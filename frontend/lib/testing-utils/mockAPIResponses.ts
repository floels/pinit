import {
  API_ENDPOINT_ACCOUNT_DETAILS,
  API_ENDPOINT_BOARD_DETAILS,
  API_ENDPOINT_PIN_DETAILS,
  API_ENDPOINT_SEARCH_PINS,
  API_ROUTE_CREATE_PIN,
  API_ROUTE_MY_ACCOUNT_DETAILS,
  API_ROUTE_OBTAIN_TOKEN,
  API_ROUTE_PIN_SUGGESTIONS,
  API_ROUTE_REFRESH_TOKEN,
  API_ROUTE_SAVE_PIN,
  API_ROUTE_SEARCH_SUGGESTIONS,
  API_ROUTE_SIGN_UP,
} from "../constants";
import { TypesOfAccount } from "../types/frontendTypes";

export const MOCK_API_RESPONSES_JSON = {
  [API_ROUTE_SIGN_UP]: {
    access_token_expiration_utc: "2024-02-07T07:09:45+00:00",
  },
  [API_ROUTE_OBTAIN_TOKEN]: {
    access_token_expiration_utc: "2024-02-08T07:09:45+00:00",
  },
  [API_ROUTE_REFRESH_TOKEN]: {
    access_token_expiration_utc: "2024-02-09T07:09:45+00:00",
  },
  [API_ROUTE_PIN_SUGGESTIONS]: {
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
  [API_ROUTE_MY_ACCOUNT_DETAILS]: {
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
  [API_ROUTE_SEARCH_SUGGESTIONS]: {
    results: [
      "foo suggestion 1",
      "foo suggestion 2",
      "foo suggestion 3",
      "foo suggestion 4",
      "foo suggestion 5",
      "foo suggestion 6",
    ],
  },
  [API_ROUTE_CREATE_PIN]: {
    unique_id: "000000000000000001",
    image_url:
      "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
    title: "Pin title",
  },
  [API_ROUTE_SAVE_PIN]: {
    board_id: "000000000000000001",
    pin_id: "000000000000000001",
  },
  [API_ENDPOINT_SEARCH_PINS]: {
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
  [API_ENDPOINT_PIN_DETAILS]: {
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
  [API_ENDPOINT_ACCOUNT_DETAILS]: {
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
  [API_ENDPOINT_BOARD_DETAILS]: {
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
  [API_ENDPOINT_PIN_DETAILS]: {
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
  [API_ENDPOINT_ACCOUNT_DETAILS]: {
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
  [API_ROUTE_MY_ACCOUNT_DETAILS]: {
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
  [API_ROUTE_PIN_SUGGESTIONS]: {
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
  [API_ENDPOINT_BOARD_DETAILS]: {
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
