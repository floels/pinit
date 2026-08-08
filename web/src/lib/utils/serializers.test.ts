import {
  serializePinsWithAuthorDetails,
  serializePinWithFullDetails,
  serializeAccountWithPublicDetails,
  serializeAccountWithPrivateDetails,
  serializeBoardWithBasicDetails,
  serializeBoardsWithBasicDetails,
  serializeBoardWithFullDetails,
} from "./serializers";
import {
  PinWithAuthorDetailsFromAPI,
  PinWithFullDetailsFromAPI,
  AccountWithPublicDetailsFromAPI,
  AccountWithPrivateDetailsFromAPI,
  BoardWithBasicDetailsFromAPI,
  BoardWithFullDetailsFromAPI,
} from "../types/backendTypes";
import { TypesOfAccount } from "../types/frontendTypes";

const MOCK_ACCOUNT_FROM_API = {
  username: "johndoe",
  display_name: "John Doe",
  initial: "J",
  profile_picture_url: "https://example.com/pic.jpg",
};

const MOCK_PIN_FROM_API: PinWithAuthorDetailsFromAPI = {
  unique_id: "100000000000000001",
  title: "My pin",
  image_url: "https://example.com/img.jpg",
  image_width: 1024,
  image_height: 768,
  author: MOCK_ACCOUNT_FROM_API,
};

describe("serializePinsWithAuthorDetails", () => {
  it("maps unique_id to id and image_url to imageURL", () => {
    const result = serializePinsWithAuthorDetails([MOCK_PIN_FROM_API]);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("100000000000000001");
    expect(result[0].imageURL).toBe("https://example.com/img.jpg");
    expect(result[0].title).toBe("My pin");
  });

  it("maps the image dimensions", () => {
    const result = serializePinsWithAuthorDetails([MOCK_PIN_FROM_API]);

    expect(result[0].imageWidth).toBe(1024);
    expect(result[0].imageHeight).toBe(768);
  });

  it("maps absent image dimensions to null", () => {
    // Pins created before the API carried the dimensions report null.
    const pinWithoutDimensions = {
      ...MOCK_PIN_FROM_API,
      image_width: null,
      image_height: null,
    };

    const result = serializePinsWithAuthorDetails([pinWithoutDimensions]);

    expect(result[0].imageWidth).toBeNull();
    expect(result[0].imageHeight).toBeNull();
  });

  it("serializes the nested author", () => {
    const result = serializePinsWithAuthorDetails([MOCK_PIN_FROM_API]);

    expect(result[0].author.displayName).toBe("John Doe");
    expect(result[0].author.profilePictureURL).toBe(
      "https://example.com/pic.jpg",
    );
  });

  it("returns an empty array for empty input", () => {
    expect(serializePinsWithAuthorDetails([])).toEqual([]);
  });
});

describe("serializePinWithFullDetails", () => {
  it("includes description alongside base pin fields", () => {
    const pin: PinWithFullDetailsFromAPI = {
      ...MOCK_PIN_FROM_API,
      description: "A great pin.",
    };

    const result = serializePinWithFullDetails(pin);

    expect(result.id).toBe("100000000000000001");
    expect(result.description).toBe("A great pin.");
  });
});

const MOCK_ACCOUNT_PUBLIC_FROM_API: AccountWithPublicDetailsFromAPI = {
  ...MOCK_ACCOUNT_FROM_API,
  boards: [
    {
      unique_id: "board001",
      name: "Travel",
      slug: "travel",
      first_image_urls: ["https://example.com/a.jpg", "https://example.com/b.jpg"],
    },
  ],
  background_picture_url: "https://example.com/bg.jpg",
  description: "A description.",
};

describe("serializeAccountWithPublicDetails", () => {
  it("maps snake_case fields to camelCase", () => {
    const result = serializeAccountWithPublicDetails(MOCK_ACCOUNT_PUBLIC_FROM_API);

    expect(result.displayName).toBe("John Doe");
    expect(result.profilePictureURL).toBe("https://example.com/pic.jpg");
    expect(result.backgroundPictureURL).toBe("https://example.com/bg.jpg");
    expect(result.description).toBe("A description.");
  });

  it("serializes nested boards", () => {
    const result = serializeAccountWithPublicDetails(MOCK_ACCOUNT_PUBLIC_FROM_API);

    expect(result.boards).toHaveLength(1);
    expect(result.boards[0].id).toBe("board001");
    expect(result.boards[0].firstImageURLs).toEqual([
      "https://example.com/a.jpg",
      "https://example.com/b.jpg",
    ]);
  });
});

describe("serializeAccountWithPrivateDetails", () => {
  it("adds type and ownerEmail to public details", () => {
    const account: AccountWithPrivateDetailsFromAPI = {
      ...MOCK_ACCOUNT_PUBLIC_FROM_API,
      type: TypesOfAccount.PERSONAL,
      owner_email: "john@example.com",
    };

    const result = serializeAccountWithPrivateDetails(account);

    expect(result.type).toBe(TypesOfAccount.PERSONAL);
    expect(result.ownerEmail).toBe("john@example.com");
    expect(result.displayName).toBe("John Doe");
  });
});

const MOCK_BOARD_FROM_API: BoardWithBasicDetailsFromAPI = {
  unique_id: "board001",
  name: "Travel",
  slug: "travel",
  first_image_urls: ["https://example.com/a.jpg"],
};

describe("serializeBoardWithBasicDetails", () => {
  it("maps unique_id to id and first_image_urls to firstImageURLs", () => {
    const result = serializeBoardWithBasicDetails(MOCK_BOARD_FROM_API);

    expect(result.id).toBe("board001");
    expect(result.name).toBe("Travel");
    expect(result.slug).toBe("travel");
    expect(result.firstImageURLs).toEqual(["https://example.com/a.jpg"]);
  });
});

describe("serializeBoardsWithBasicDetails", () => {
  it("maps an array of boards", () => {
    const result = serializeBoardsWithBasicDetails([
      MOCK_BOARD_FROM_API,
      { ...MOCK_BOARD_FROM_API, unique_id: "board002", name: "Food" },
    ]);

    expect(result).toHaveLength(2);
    expect(result[1].id).toBe("board002");
    expect(result[1].name).toBe("Food");
  });
});

describe("serializeBoardWithFullDetails", () => {
  it("includes serialized author and pins", () => {
    const board: BoardWithFullDetailsFromAPI = {
      ...MOCK_BOARD_FROM_API,
      author: MOCK_ACCOUNT_FROM_API,
      pins: [MOCK_PIN_FROM_API],
    };

    const result = serializeBoardWithFullDetails(board);

    expect(result.author.displayName).toBe("John Doe");
    expect(result.pins).toHaveLength(1);
    expect(result.pins[0].id).toBe("100000000000000001");
  });
});
