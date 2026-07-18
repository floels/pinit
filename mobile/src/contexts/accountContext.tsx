import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";

import { AccountWithPrivateDetails } from "@/src/lib/types";

type AccountContextType = {
  account: AccountWithPrivateDetails | null;
  setAccount: Dispatch<SetStateAction<AccountWithPrivateDetails | null>>;
};

export const AccountContext = createContext<AccountContextType>({
  account: null,
  setAccount: () => {},
});

export const AccountContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [account, setAccount] = useState<AccountWithPrivateDetails | null>(
    null,
  );

  return (
    <AccountContext.Provider value={{ account, setAccount }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccountContext = () => useContext(AccountContext);
