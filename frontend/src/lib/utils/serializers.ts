import {
  AccountFromAPI,
  AccountWithPrivateDetailsFromAPI,
  AccountWithPublicDetailsFromAPI,
  BoardFromAPI,
  BoardWithBasicDetailsFromAPI,
  BoardWithFullDetailsFromAPI,
  PinWithAuthorDetailsFromAPI,
  PinWithFullDetailsFromAPI,
} from "../types/backendTypes";
import {
  Account,
  AccountWithPrivateDetails,
  AccountWithPublicDetails,
  Board,
  BoardWithBasicDetails,
  BoardWithFullDetails,
  PinWithAuthorDetails,
  PinWithFullDetails,
} from "../types/frontendTypes";

const serializePinWithAuthorDetails = (
  pin: PinWithAuthorDetailsFromAPI,
): PinWithAuthorDetails => {
  return {
    id: pin.unique_id,
    title: pin.title,
    imageURL: pin.image_url,
    author: serializeAccount(pin.author),
  };
};

export const serializePinsWithAuthorDetails = (
  pins: PinWithAuthorDetailsFromAPI[],
): PinWithAuthorDetails[] => {
  return pins.map(serializePinWithAuthorDetails);
};

export const serializePinWithFullDetails = (
  pin: PinWithFullDetailsFromAPI,
): PinWithFullDetails => {
  return {
    ...serializePinWithAuthorDetails(pin),
    description: pin.description,
  };
};

const serializeAccount = (account: AccountFromAPI): Account => {
  return {
    username: account.username,
    displayName: account.display_name,
    initial: account.initial,
    profilePictureURL: account.profile_picture_url,
  };
};

export const serializeAccountWithPublicDetails = (
  account: AccountWithPublicDetailsFromAPI,
): AccountWithPublicDetails => {
  return {
    ...serializeAccount(account),
    boards: serializeBoardsWithBasicDetails(account.boards),
    backgroundPictureURL: account.background_picture_url,
    description: account.description,
  };
};

export const serializeAccountWithPrivateDetails = (
  account: AccountWithPrivateDetailsFromAPI,
): AccountWithPrivateDetails => {
  return {
    ...serializeAccountWithPublicDetails(account),
    type: account.type,
    ownerEmail: account.owner_email,
  };
};

const serializeBoard = (board: BoardFromAPI): Board => {
  return {
    id: board.unique_id,
    name: board.name,
    slug: board.slug,
  };
};

export const serializeBoardWithBasicDetails = (
  board: BoardWithBasicDetailsFromAPI,
): BoardWithBasicDetails => {
  return {
    ...serializeBoard(board),
    firstImageURLs: board.first_image_urls,
  };
};

export const serializeBoardsWithBasicDetails = (
  boards: BoardWithBasicDetailsFromAPI[],
): BoardWithBasicDetails[] => {
  return boards.map(serializeBoardWithBasicDetails);
};

export const serializeBoardWithFullDetails = (
  board: BoardWithFullDetailsFromAPI,
): BoardWithFullDetails => {
  return {
    ...serializeBoard(board),
    author: serializeAccount(board.author),
    pins: serializePinsWithAuthorDetails(board.pins),
  };
};
