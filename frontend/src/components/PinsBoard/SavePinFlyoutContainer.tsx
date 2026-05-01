import React, { useEffect, useRef } from "react";
import { BoardWithBasicDetails } from "@/lib/types/frontendTypes";
import SavePinFlyout from "./SavePinFlyout";

type SavePinFlyoutContainerProps = {
  isInFirstColumn: boolean;
  isInLastColumn: boolean;
  boards: BoardWithBasicDetails[];
  isSaving: boolean;
  getClickHandlerForBoard: ({
    boardIndex,
  }: {
    boardIndex: number;
  }) => () => void;
  handleClickOutOfSaveFlyout: () => void;
  openerRef: React.RefObject<HTMLButtonElement | null>;
};

const SavePinFlyoutContainer = ({
  isInFirstColumn,
  isInLastColumn,
  boards,
  isSaving,
  getClickHandlerForBoard,
  handleClickOutOfSaveFlyout,
  openerRef,
}: SavePinFlyoutContainerProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleClickDocument = (event: MouseEvent) => {
    const target = event.target as Node;

    const userClickedOut =
      !ref.current?.contains(target) && !openerRef.current?.contains(target);

    if (userClickedOut) {
      handleClickOutOfSaveFlyout();
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickDocument);

    return () => {
      document.removeEventListener("click", handleClickDocument);
    };
  }, []);

  return (
    <SavePinFlyout
      isInFirstColumn={isInFirstColumn}
      isInLastColumn={isInLastColumn}
      boards={boards}
      isSaving={isSaving}
      getClickHandlerForBoard={getClickHandlerForBoard}
      ref={ref}
    />
  );
};

export default SavePinFlyoutContainer;
