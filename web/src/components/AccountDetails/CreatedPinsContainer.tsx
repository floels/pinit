import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { appendQueryParam } from "@/lib/utils/strings";
import CreatedPins from "./CreatedPins";
import { PinWithFullDetails } from "@/lib/types/frontendTypes";
import { serializePinsWithFullDetails } from "@/lib/utils/serializers";
import { throwIfKO } from "@/lib/utils/fetch";
import { API_URL_CREATED_PINS } from "@/lib/constants";
import { useAccountContext } from "@/contexts/accountContext";

type CreatedPinsProps = {
  username: string;
};

type CreatedPinsQueryData = {
  pins: PinWithFullDetails[];
  hasNextPage: boolean;
};

const CreatedPinsContainer = ({ username }: CreatedPinsProps) => {
  const { account } = useAccountContext();
  const isOwnProfile = account?.username === username;
  const queryClient = useQueryClient();

  // The page number is stored together with the username it belongs to. A new
  // username therefore starts back at page 1 during the same render, without an
  // effect and without a fetch for the wrong page.
  const [pagination, setPagination] = useState({ username, page: 1 });

  const currentPage = pagination.username === username ? pagination.page : 1;

  const queryKey = ["createdPins", username, currentPage];

  const { data, isFetching, isError } = useQuery({
    queryKey,
    queryFn: async (): Promise<CreatedPinsQueryData> => {
      const url = appendQueryParam({
        url: `${API_URL_CREATED_PINS}/${username}/pins/`,
        key: "page",
        value: currentPage.toString(),
      });

      const response = await fetch(url);
      throwIfKO(response);
      const responseData = await response.json();

      return {
        pins: serializePinsWithFullDetails(responseData.results),
        hasNextPage: responseData.next !== null,
      };
    },
    placeholderData: (previousData) => previousData,
  });

  const pins = data?.pins ?? [];
  const hasNextPage = data?.hasNextPage ?? false;

  const handleNextPage = () =>
    setPagination({ username, page: currentPage + 1 });
  const handlePreviousPage = () =>
    setPagination({ username, page: currentPage - 1 });

  const handlePinDeleted = (pinId: string) => {
    queryClient.setQueryData<CreatedPinsQueryData>(queryKey, (old) => {
      if (!old) return old;
      return { ...old, pins: old.pins.filter((p) => p.id !== pinId) };
    });
  };

  const handlePinUpdated = (
    pinId: string,
    title: string | null,
    description: string | null,
  ) => {
    queryClient.setQueryData<CreatedPinsQueryData>(queryKey, (old) => {
      if (!old) return old;
      return {
        ...old,
        pins: old.pins.map((p) =>
          p.id === pinId ? { ...p, title, description: description ?? "" } : p,
        ),
      };
    });
  };

  return (
    <CreatedPins
      pins={pins}
      isFetching={isFetching}
      fetchFailed={isError}
      isOwnProfile={isOwnProfile}
      currentPage={currentPage}
      hasNextPage={hasNextPage}
      onNextPage={handleNextPage}
      onPreviousPage={handlePreviousPage}
      onPinDeleted={handlePinDeleted}
      onPinUpdated={handlePinUpdated}
    />
  );
};

export default CreatedPinsContainer;
