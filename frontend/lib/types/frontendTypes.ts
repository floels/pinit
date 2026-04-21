type Pin = {
  id: string;
  title: string | null;
  imageURL: string;
};

export type PinWithAuthorDetails = Pin & {
  author: Account;
};

export type PinWithFullDetails = PinWithAuthorDetails & {
  description: string;
};

export enum TypesOfAccount {
  PERSONAL = "personal",
  BUSINESS = "business",
}

export type Account = {
  username: string;
  displayName: string;
  initial: string;
  profilePictureURL: string | null;
};

export type AccountWithPublicDetails = Account & {
  boards: BoardWithBasicDetails[];
  backgroundPictureURL: string | null;
  description: string | null;
};

export type AccountWithPrivateDetails = AccountWithPublicDetails & {
  type: TypesOfAccount;
  ownerEmail: string;
};

export type Board = {
  id: string;
  name: string;
  slug: string;
};

export type BoardWithBasicDetails = Board & {
  firstImageURLs: string[];
};

export type BoardWithFullDetails = Board & {
  author: Account;
  pins: PinWithAuthorDetails[];
};
