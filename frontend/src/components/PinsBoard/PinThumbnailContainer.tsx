import { useAccountContext } from "@/contexts/accountContext";
import { toast } from "react-toastify";
import {
  Board,
  BoardWithBasicDetails,
  PinWithAuthorDetails,
} from "@/lib/types/frontendTypes";
import PinThumbnail from "./PinThumbnail";
import CreateBoardModal from "./CreateBoardModal";
import BoardCreatedToastMessage from "./BoardCreatedToastMessage";
import { useEffect, useState } from "react";
import { API_URL_SAVE_PIN } from "@/lib/constants";
import { useTranslation } from "react-i18next";
import { throwIfKO } from "@/lib/utils/fetch";

type PinThumbnailContainerProps = {
  pin: PinWithAuthorDetails;
  isInFirstColumn: boolean;
  isInLastColumn: boolean;
};

const PinThumbnailContainer = ({
  pin,
  isInFirstColumn,
  isInLastColumn,
}: PinThumbnailContainerProps) => {
  const { t } = useTranslation("PinsBoard");

  const { account, setAccount } = useAccountContext();

  const boards = account?.boards || [];

  const [isImageHovered, setIsImageHovered] = useState(false);
  const [isSaveFlyoutOpen, setIsSaveFlyoutOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [indexBoardWhereJustSaved, setIndexBoardWhereJustSaved] = useState<
    number | null
  >(null);
  const [isMoreActionsDropdownOpen, setIsMoreActionsDropdownOpen] =
    useState(false);
  const [isCreateBoardModalOpen, setIsCreateBoardModalOpen] = useState(false);

  const handleMouseEnterImage = () => {
    setIsImageHovered(true);
  };

  const handleMouseLeaveImage = () => {
    setIsImageHovered(false);
  };

  const handleClickSave = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // otherwise we'll navigate to pin details

    setIsSaveFlyoutOpen(true);
  };

  const handleClickOutOfSaveFlyout = () => {
    setIsSaveFlyoutOpen(false);
  };

  const handleClickMoreActions = (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    setIsMoreActionsDropdownOpen((prev) => !prev);
  };

  const handleClickOutOfMoreActionsDropdown = () => {
    setIsMoreActionsDropdownOpen(false);
  };

  const handleDownloadImage = async (
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    event.preventDefault();
    setIsMoreActionsDropdownOpen(false);

    try {
      const response = await fetch(pin.imageURL);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const extension = blob.type.split("/")[1] || "jpg";
      link.download = `${pin.title || `pin-${pin.id}`}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      toast.warn(t("DOWNLOAD_IMAGE_ERROR_MESSAGE"), {
        toastId: "toast-download-image-error",
      });
    }
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsSaveFlyoutOpen(false);
      setIsMoreActionsDropdownOpen(false);
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
    pin: PinWithAuthorDetails;
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
    pin: PinWithAuthorDetails;
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

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <PinThumbnail
        pin={pin}
        isInFirstColumn={isInFirstColumn}
        isInLastColumn={isInLastColumn}
        boards={boards}
        isImageHovered={isImageHovered}
        isSaveFlyoutOpen={isSaveFlyoutOpen}
        isSaving={isSaving}
        indexBoardWhereJustSaved={indexBoardWhereJustSaved}
        isMoreActionsDropdownOpen={isMoreActionsDropdownOpen}
        handleMouseEnterImage={handleMouseEnterImage}
        handleMouseLeaveImage={handleMouseLeaveImage}
        handleClickSave={handleClickSave}
        getClickHandlerForBoard={getClickHandlerForBoard}
        handleClickOutOfSaveFlyout={handleClickOutOfSaveFlyout}
        handleClickMoreActions={handleClickMoreActions}
        handleClickOutOfMoreActionsDropdown={handleClickOutOfMoreActionsDropdown}
        handleDownloadImage={handleDownloadImage}
        handleClickCreateBoard={handleClickCreateBoard}
      />
      {isCreateBoardModalOpen && (
        <CreateBoardModal
          pin={pin}
          onClose={() => setIsCreateBoardModalOpen(false)}
          onSuccess={handleBoardCreated}
        />
      )}
    </>
  );
};

export default PinThumbnailContainer;
