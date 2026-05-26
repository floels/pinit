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
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchCreatedPins = async (page: number) => {
    const url = appendQueryParam({
      url: `${API_URL_CREATED_PINS}/${username}/pins/`,
      key: "page",
      value: page.toString(),
    });

    const response = await fetch(url);

    throwIfKO(response);

    const responseData = await response.json();

    return {
      pins: serializePinsWithFullDetails(responseData.results),
      hasNextPage: responseData.next !== null,
    };
  };

  const fetchCreatedPinsAndFallBack = async (page: number) => {
    setIsFetching(true);
    setFetchFailed(false);

    let result: { pins: PinWithFullDetails[]; hasNextPage: boolean };

    try {
      result = await fetchCreatedPins(page);
    } catch {
      setFetchFailed(true);
      setIsFetching(false);
      return;
    }

    setIsFetching(false);
    setPins(result.pins);
    setHasNextPage(result.hasNextPage);
  };

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    fetchCreatedPinsAndFallBack(nextPage);
  };

  const handlePreviousPage = () => {
    const prevPage = currentPage - 1;
    setCurrentPage(prevPage);
    fetchCreatedPinsAndFallBack(prevPage);
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
    setCurrentPage(1);
    fetchCreatedPinsAndFallBack(1);
  }, [username]);

  return (
    <CreatedPinsBoard
      pins={pins}
      isFetching={isFetching}
      fetchFailed={fetchFailed}
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

export default CreatedPins;
