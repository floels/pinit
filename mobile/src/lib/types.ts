export enum TypesOfAccount {
  PERSONAL = "personal",
  BUSINESS = "business",
}

export type Account = {
  username: string;
  displayName: string;
  profilePictureURL: string | null;
};

export type Pin = {
  id: string;
  title: string;
  imageURL: string;
  // Pixel dimensions of the image. The API requires them when a pin is created,
  // so every pin it returns carries them.
  imageWidth: number;
  imageHeight: number;
};

export type PinWithAuthorDetails = Pin & {
  author: Account;
};

export type PinWithFullDetails = PinWithAuthorDetails & {
  description: string;
};

export type AccountWithPublicDetails = Account & {
  boards: Board[];
  initial: string;
  backgroundPictureURL: string | null;
  description: string | null;
};

export type AccountWithPrivateDetails = AccountWithPublicDetails & {
  type: TypesOfAccount;
  ownerEmail: string;
};

export type Board = {
  id: string;
  title: string;
  firstImageURLs: string[];
};
