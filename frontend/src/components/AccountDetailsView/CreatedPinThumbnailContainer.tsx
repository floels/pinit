import { useAccountContext } from "@/contexts/accountContext";
import { toast } from "react-toastify";
import {
  Board,
  BoardWithBasicDetails,
  PinWithFullDetails,
} from "@/lib/types/frontendTypes";
import CreatedPinThumbnail from "./CreatedPinThumbnail";
import CreateBoardModal from "../PinsBoard/CreateBoardModal";
import BoardCreatedToastMessage from "../PinsBoard/BoardCreatedToastMessage";
import EditPinPanel from "./EditPinPanel";
import { useEffect, useState } from "react";
import { API_URL_SAVE_PIN } from "@/lib/constants";
import { useTranslation } from "react-i18next";
import { throwIfKO } from "@/lib/utils/fetch";

type CreatedPinThumbnailContainerProps = {
  pin: PinWithFullDetails;
  isInFirstColumn: boolean;
  isInLastColumn: boolean;
  isOwnProfile: boolean;
  onPinDeleted: (pinId: string) => void;
  onPinUpdated: (
    pinId: string,
    title: string | null,
    description: string | null,
  ) => void;
};

const CreatedPinThumbnailContainer = ({
  pin: initialPin,
  isInFirstColumn,
  isInLastColumn,
  isOwnProfile,
  onPinDeleted,
  onPinUpdated,
}: CreatedPinThumbnailContainerProps) => {
  const { t } = useTranslation("PinsBoard");

  const { account, setAccount } = useAccountContext();

  const boards = account?.boards || [];

  const [pin, setPin] = useState<PinWithFullDetails>(initialPin);
  const [isImageHovered, setIsImageHovered] = useState(false);
  const [isSaveFlyoutOpen, setIsSaveFlyoutOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [indexBoardWhereJustSaved, setIndexBoardWhereJustSaved] = useState<
    number | null
  >(null);
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);

  const handleMouseEnterImage = () => {
    setIsImageHovered(true);
  };

  const handleMouseLeaveImage = () => {
    setIsImageHovered(false);
  };

  const handleClickSave = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsSaveFlyoutOpen(true);
  };

  const handleClickOutOfSaveFlyout = () => {
    setIsSaveFlyoutOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsSaveFlyoutOpen(false);
      setIsEditPanelOpen(false);
    }
  };

  const getClickHandlerForBoard = ({ boardIndex }: { boardIndex: number }) => {
    return () => {
      savePinInBoard({ boardIndex, pin });
    };
  };

  const savePinInBoard = async ({
    boardIndex,
    pin,
  }: {
    boardIndex: number;
    pin: PinWithFullDetails;
  }) => {
    const board = boards[boardIndex];

    setIsSaving(true);

    try {
      await fetchSavePinInBoard({ board, pin });
    } catch {
      handleSaveError();
      return;
    } finally {
      setIsSaving(false);
    }

    handleSaveSuccess({ boardIndex });
  };

  const fetchSavePinInBoard = async ({
    board,
    pin,
  }: {
    board: BoardWithBasicDetails;
    pin: PinWithFullDetails;
  }) => {
    const requestBody = JSON.stringify({
      pin_id: pin.id,
      board_id: board.id,
    });

    const response = await fetch(API_URL_SAVE_PIN, {
      method: "POST",
      body: requestBody,
    });

    throwIfKO(response);

    return response;
  };

  const handleSaveSuccess = ({ boardIndex }: { boardIndex: number }) => {
    setIndexBoardWhereJustSaved(boardIndex);
    setIsSaveFlyoutOpen(false);
  };

  const handleSaveError = () => {
    toast.warn(t("PIN_SAVE_ERROR_MESSAGE"), {
      toastId: "toast-pin-save-error",
    });
  };

  const handleClickCreateBoard = () => {
    setIsSaveFlyoutOpen(false);
    setIsCreateBoardModalOpen(true);
  };

  const handleBoardCreated = (board: Board) => {
    setIsCreateBoardModalOpen(false);

    if (account) {
      const newBoard: BoardWithBasicDetails = {
        ...board,
        firstImageURLs: [pin.imageURL],
      };
      setAccount({
        ...account,
        boards: [...account.boards, newBoard],
      });
    }

    toast.success(
      () => (
        <BoardCreatedToastMessage
          username={account!.username}
          slug={board.slug}
        />
      ),
      { toastId: "toast-board-created" },
    );
  };

  const handleClickEdit = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsEditPanelOpen(true);
  };

  const handleEditSave = (
    newTitle: string | null,
    newDescription: string | null,
  ) => {
    const updatedPin = { ...pin, title: newTitle, description: newDescription ?? "" };
    setPin(updatedPin);
    onPinUpdated(pin.id, newTitle, newDescription);
  };

  const handleEditDelete = () => {
    onPinDeleted(pin.id);
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <CreatedPinThumbnail
        pin={pin}
        isInFirstColumn={isInFirstColumn}
        isInLastColumn={isInLastColumn}
        boards={boards}
        isImageHovered={isImageHovered}
        isSaveFlyoutOpen={isSaveFlyoutOpen}
        isSaving={isSaving}
        indexBoardWhereJustSaved={indexBoardWhereJustSaved}
        isOwnProfile={isOwnProfile}
        handleMouseEnterImage={handleMouseEnterImage}
        handleMouseLeaveImage={handleMouseLeaveImage}
        handleClickSave={handleClickSave}
        getClickHandlerForBoard={getClickHandlerForBoard}
        handleClickOutOfSaveFlyout={handleClickOutOfSaveFlyout}
        handleClickCreateBoard={handleClickCreateBoard}
        handleClickEdit={handleClickEdit}
      />
      {isCreateBoardModalOpen && (
        <CreateBoardModal
          pin={pin}
          onClose={() => setIsCreateBoardModalOpen(false)}
          onSuccess={handleBoardCreated}
        />
      )}
      {isEditPanelOpen && (
        <EditPinPanel
          pin={pin}
          onClose={() => setIsEditPanelOpen(false)}
          onSave={handleEditSave}
          onDelete={handleEditDelete}
        />
      )}
    </>
  );
};

export default CreatedPinThumbnailContainer;
