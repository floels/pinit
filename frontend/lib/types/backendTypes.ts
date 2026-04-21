import { TypesOfAccount } from "./frontendTypes";

type PinFromAPI = {
  unique_id: string;
  title: string | null;
  image_url: string;
};

export type PinWithAuthorDetailsFromAPI = PinFromAPI & {
  author: AccountFromAPI;
};

export type PinWithFullDetailsFromAPI = PinWithAuthorDetailsFromAPI & {
  description: string;
};

export type AccountFromAPI = {
  username: string;
  display_name: string;
  initial: string;
  profile_picture_url: string | null;
};

export type AccountWithPublicDetailsFromAPI = AccountFromAPI & {
  boards: BoardWithBasicDetailsFromAPI[];
  background_picture_url: string | null;
  description: string | null;
};

export type AccountWithPrivateDetailsFromAPI =
  AccountWithPublicDetailsFromAPI & {
    type: TypesOfAccount;
    owner_email: string;
  };

export type BoardFromAPI = {
  unique_id: string;
  name: string;
  slug: string;
};

export type BoardWithBasicDetailsFromAPI = BoardFromAPI & {
  first_image_urls: string[];
};

export type BoardWithFullDetailsFromAPI = BoardWithBasicDetailsFromAPI & {
  author: AccountFromAPI;
  pins: PinWithAuthorDetailsFromAPI[];
};
