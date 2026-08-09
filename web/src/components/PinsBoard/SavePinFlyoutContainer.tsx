import React, { useEffect, useEffectEvent, useRef } from "react";
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
  handleClickCreateBoard: () => void;
  openerRef: React.RefObject<HTMLButtonElement | null>;
};

const SavePinFlyoutContainer = ({
  isInFirstColumn,
  isInLastColumn,
  boards,
  isSaving,
  getClickHandlerForBoard,
  handleClickOutOfSaveFlyout,
  handleClickCreateBoard,
  openerRef,
}: SavePinFlyoutContainerProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // 'useEffectEvent' so that the listener always calls the current
  // 'handleClickOutOfSaveFlyout', while the effect below subscribes only once:
  const onClickDocument = useEffectEvent((target: Node) => {
    const userClickedOut =
      !ref.current?.contains(target) && !openerRef.current?.contains(target);

    if (userClickedOut) {
      handleClickOutOfSaveFlyout();
    }
  });

  useEffect(() => {
    const handleClickDocument = (event: MouseEvent) => {
      onClickDocument(event.target as Node);
    };

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
      onClickCreateBoard={handleClickCreateBoard}
      ref={ref}
    />
  );
};

export default SavePinFlyoutContainer;
