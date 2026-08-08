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
  // Pixel dimensions reported by the API. They are null for pins created before
  // the API carried them, so the caller must keep a fallback.
  imageWidth: number | null;
  imageHeight: number | null;
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
