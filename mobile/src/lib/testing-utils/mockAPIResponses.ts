import {
  API_ENDPOINT_ACCOUNT_DETAILS,
  API_ENDPOINT_CREATE_PIN,
  API_ENDPOINT_MY_ACCOUNT_DETAILS,
  API_ENDPOINT_OBTAIN_TOKEN,
  API_ENDPOINT_PIN_DETAILS,
  API_ENDPOINT_PIN_SUGGESTIONS,
  API_ENDPOINT_REFRESH_TOKEN,
  API_ENDPOINT_SEARCH_PINS,
  API_ENDPOINT_SEARCH_SUGGESTIONS,
} from "../constants";
import { TypesOfAccount } from "../types";

export const MOCK_API_RESPONSES_JSON = {
  [API_ENDPOINT_OBTAIN_TOKEN]: {
    access_token: "access_token",
    refresh_token: "refresh_token",
    access_token_expiration_utc: "2024-02-08T07:09:45+00:00",
  },
  [API_ENDPOINT_REFRESH_TOKEN]: {
    access_token: "refreshed_access_token",
    access_token_expiration_utc: "2024-02-09T07:09:45+00:00",
  },
  [API_ENDPOINT_PIN_SUGGESTIONS]: {
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
  [API_ENDPOINT_MY_ACCOUNT_DETAILS]: {
    username: "johndoe",
    display_name: "John Doe",
    profile_picture_url:
      "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
    boards: [
      {
        unique_id: "000000000000000001",
        title: "Board 1 title",
        first_image_urls: [
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
        ],
      },
      {
        unique_id: "000000000000000002",
        title: "Board 2 title",
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
  [API_ENDPOINT_PIN_DETAILS]: {
    unique_id: "837672678962535495",
    image_url: "http://example.com",
    title: "Pin title",
    author: {
      username: "johndoe",
      display_name: "John Doe",
      profile_picture_url: "http://example.com",
    },
    description: "Pin description.",
  },
  [API_ENDPOINT_SEARCH_SUGGESTIONS]: {
    results: [
      "foo suggestion 1",
      "foo suggestion 2",
      "foo suggestion 3",
      "foo suggestion 4",
      "foo suggestion 5",
      "foo suggestion 6",
    ],
  },
  [API_ENDPOINT_CREATE_PIN]: {
    unique_id: "000000000000000001",
    image_url:
      "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
    title: "Pin title",
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
  [API_ENDPOINT_ACCOUNT_DETAILS]: {
    username: "johndoe",
    display_name: "John Doe",
    profile_picture_url:
      "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
    boards: [
      {
        unique_id: "000000000000000001",
        title: "Board 1 title",
        first_image_urls: [
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
        ],
      },
      {
        unique_id: "000000000000000002",
        title: "Board 2 title",
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
};

// NB: we don't use the serializers defined in
// 'lib/utils/serializers.ts' here because otherwise we wouldn't
// be able to detect in the tests if there is a bug in them.
export const MOCK_API_RESPONSES_SERIALIZED = {
  [API_ENDPOINT_MY_ACCOUNT_DETAILS]: {
    username: "johndoe",
    displayName: "John Doe",
    profilePictureURL:
      "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
    boards: [
      {
        id: "000000000000000001",
        title: "Board 1 title",
        firstImageURLs: [
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
        ],
      },
      {
        id: "000000000000000002",
        title: "Board 2 title",
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
    description: null,
    type: TypesOfAccount.PERSONAL,
    ownerEmail: "john.doe@example.com",
  },
  [API_ENDPOINT_PIN_SUGGESTIONS]: {
    results: Array.from({ length: 50 }, (_, index) => ({
      id: String(index).padStart(18, "0"),
      title: `Pin ${index + 1} title`,
      imageURL:
        "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
      author: {
        username: "johndoe",
        displayName: "John Doe",
        profilePictureURL:
          "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
      },
    })),
  },
  [API_ENDPOINT_PIN_DETAILS]: {
    id: "837672678962535495",
    imageURL: "http://example.com",
    title: "Pin title",
    author: {
      username: "johndoe",
      displayName: "John Doe",
      profilePictureURL: "http://example.com",
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
        title: "Board 1 title",
        firstImageURLs: [
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
          "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
        ],
      },
      {
        id: "000000000000000002",
        title: "Board 2 title",
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
  [API_ENDPOINT_SEARCH_PINS]: {
    results: Array.from({ length: 50 }, (_, index) => ({
      id: String(index).padStart(18, "0"),
      imageURL:
        "https://i.pinimg.com/564x/fb/71/38/fb7138bb24bc5dabdaf3908a961cdfc6.jpg",
      title: `Pin ${index + 1} title`,
      author: {
        username: "johndoe",
        displayName: "John Doe",
        profilePictureURL:
          "https://i.pinimg.com/564x/49/ce/d2/49ced2e29b6d4945a13be722bac54642.jpg",
      },
    })),
  },
};

export const MOCK_API_RESPONSES = Object.fromEntries(
  Object.entries(MOCK_API_RESPONSES_JSON).map(([key, value]) => [
    key,
    JSON.stringify(value),
  ]),
);
