import { useEffect, useRef, useState } from "react";
import LogoutTrigger from "../LogoutTrigger/LogoutTrigger";
import AccountOptionsFlyout from "./AccountOptionsFlyout";

type AccountOptionsFlyoutContainerProps = {
  handleClickOutOfAccountOptionsFlyout: () => void;
};

const AccountOptionsFlyoutContainer = ({
  handleClickOutOfAccountOptionsFlyout,
}: AccountOptionsFlyoutContainerProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const [clickedLogOut, setClickedLogOut] = useState(false);

  const handleClickLogOut = () => {
    setClickedLogOut(true);
  };

  const handleClickDocument = (event: MouseEvent) => {
    const target = event.target as Node;

    const userClickedOut = !ref.current?.contains(target);

    if (userClickedOut) {
      handleClickOutOfAccountOptionsFlyout();
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickDocument);

    return () => {
      document.removeEventListener("click", handleClickDocument);
    };
  }, []);

  if (clickedLogOut) {
    return <LogoutTrigger />;
  }

  return (
    <AccountOptionsFlyout ref={ref} handleClickLogOut={handleClickLogOut} />
  );
};

export default AccountOptionsFlyoutContainer;
