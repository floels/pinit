import {
  AccountWithPrivateDetails,
  AccountWithPublicDetails,
  Board,
  PinWithAuthorDetails,
  Pin,
  PinWithFullDetails,
  Account,
} from "../types";

const serializeAccount = (account: any): Account => {
  return {
    username: account.username,
    displayName: account.display_name,
    profilePictureURL: account.profile_picture_url,
  };
};

export const serializePin = (pin: any): Pin => {
  return {
    id: pin.unique_id,
    imageURL: pin.image_url,
    title: pin.title,
  };
};

export const serializePinWithAuthorDetails = (
  pin: any,
): PinWithAuthorDetails => {
  return {
    ...serializePin(pin),
    author: serializeAccount(pin.author),
  };
};

export const serializePinsWithAuthorDetails = (
  pins: any,
): PinWithAuthorDetails[] => {
  return pins.map(serializePinWithAuthorDetails);
};

export const serializePinWithFullDetails = (pin: any): PinWithFullDetails => {
  return {
    ...serializePinWithAuthorDetails(pin),
    description: pin.description,
  };
};

export const serializeAccountWithPublicDetails = (
  account: any,
): AccountWithPublicDetails => {
  return {
    ...serializeAccount(account),
    initial: account.initial,
    boards: serializeBoards(account.boards),
    backgroundPictureURL: account.background_picture_url,
    description: account.description,
  };
};

export const serializeAccountWithPrivateDetails = (
  account: any,
): AccountWithPrivateDetails => {
  return {
    ...serializeAccountWithPublicDetails(account),
    type: account.type,
    ownerEmail: account.owner_email,
  };
};

export const serializeBoard = (board: any): Board => {
  return {
    id: board.unique_id,
    title: board.title,
    firstImageURLs: board.first_image_urls,
  };
};

export const serializeBoards = (boards: any): Board[] => {
  return boards.map(serializeBoard);
};
