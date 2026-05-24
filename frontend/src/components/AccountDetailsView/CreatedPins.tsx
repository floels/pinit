import { useState, useEffect } from "react";
import { appendQueryParam } from "@/lib/utils/strings";
import CreatedPinsBoard from "./CreatedPinsBoard";
import { PinWithFullDetails } from "@/lib/types/frontendTypes";
import { serializePinsWithFullDetails } from "@/lib/utils/serializers";
import { throwIfKO } from "@/lib/utils/fetch";
import { API_URL_CREATED_PINS } from "@/lib/constants";
import { useAccountContext } from "@/contexts/accountContext";

type CreatedPinsProps = {
  username: string;
};

const CreatedPins = ({ username }: CreatedPinsProps) => {
  const { account } = useAccountContext();

  const isOwnProfile = account?.username === username;

  const [currentPage, setCurrentPage] = useState(1);
  const [pins, setPins] = useState<PinWithFullDetails[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchFailed, setFetchFailed] = useState(false);

  const fetchCreatedPins = async (page: number) => {
    const url = appendQueryParam({
      url: `${API_URL_CREATED_PINS}/${username}/pins/`,
      key: "page",
      value: page.toString(),
    });

    const response = await fetch(url);

    throwIfKO(response);

    const responseData = await response.json();

    return serializePinsWithFullDetails(responseData.results);
  };

  const fetchCreatedPinsAndFallBack = async (page: number) => {
    setIsFetching(true);
    setFetchFailed(false);

    let newPins: PinWithFullDetails[];

    try {
      newPins = await fetchCreatedPins(page);
    } catch {
      setFetchFailed(true);
      setIsFetching(false);
      return;
    }

    setIsFetching(false);
    setPins((currentPins) => (page === 1 ? newPins : [...currentPins, ...newPins]));
  };

  const handleScrolledToBottom = () => {
    if (!isFetching) {
      setCurrentPage((previousPage) => previousPage + 1);
    }
  };

  const handlePinDeleted = (pinId: string) => {
    setPins((currentPins) => currentPins.filter((p) => p.id !== pinId));
  };

  const handlePinUpdated = (
    pinId: string,
    title: string | null,
    description: string | null,
  ) => {
    setPins((currentPins) =>
      currentPins.map((p) =>
        p.id === pinId ? { ...p, title, description: description ?? "" } : p,
      ),
    );
  };

  useEffect(() => {
    fetchCreatedPinsAndFallBack(1);
    setCurrentPage(1);
  }, [username]);

  useEffect(() => {
    if (currentPage > 1) {
      fetchCreatedPinsAndFallBack(currentPage);
    }
  }, [currentPage]);

  return (
    <CreatedPinsBoard
      pins={pins}
      isFetching={isFetching}
      fetchFailed={fetchFailed}
      isOwnProfile={isOwnProfile}
      onScrolledToBottom={handleScrolledToBottom}
      onPinDeleted={handlePinDeleted}
      onPinUpdated={handlePinUpdated}
    />
  );
};

export default CreatedPins;
