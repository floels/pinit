import { useState } from "react";
import { useUpdatePin } from "@/lib/hooks/useUpdatePin";
import { useDeletePin } from "@/lib/hooks/useDeletePin";
import EditPinPanel from "./EditPinPanel";

type EditPinPanelContainerProps = {
  pin: { id: string; title: string | null; description: string | null };
  onClose: () => void;
  onSave: (title: string | null, description: string | null) => void;
  onDelete: () => void;
};

const EditPinPanelContainer = ({
  pin,
  onClose,
  onSave,
  onDelete,
}: EditPinPanelContainerProps) => {
  const [title, setTitle] = useState(pin.title ?? "");
  const [description, setDescription] = useState(pin.description ?? "");

  const updatePin = useUpdatePin();
  const deletePin = useDeletePin();

  const trimmedTitle = title.trim() || null;
  const trimmedDescription = description.trim() || null;

  const handleSave = () => {
    updatePin.mutate(
      { pinId: pin.id, title: trimmedTitle, description: trimmedDescription },
      {
        onSuccess: () => {
          onSave(trimmedTitle, trimmedDescription);
          onClose();
        },
      },
    );
  };

  const handleDelete = () => {
    deletePin.mutate(pin.id, {
      onSuccess: () => {
        onDelete();
        onClose();
      },
    });
  };

  return (
    <EditPinPanel
      title={title}
      description={description}
      onTitleChange={setTitle}
      onDescriptionChange={setDescription}
      isSaving={updatePin.isPending}
      isDeleting={deletePin.isPending}
      saveError={updatePin.isError}
      deleteError={deletePin.isError}
      onSave={handleSave}
      onDelete={handleDelete}
      onClose={onClose}
    />
  );
};

export default EditPinPanelContainer;
