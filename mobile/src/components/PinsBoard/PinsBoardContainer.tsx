import {
  InfiniteData,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { NativeScrollEvent, NativeSyntheticEvent } from "react-native";

import PinsBoard, { THRESHOLD_PULL_TO_REFRESH } from "./PinsBoard";

import { fetchPublic } from "@/src/lib/api/fetchers";
import { ResponseKOError } from "@/src/lib/customErrors";
import { PinWithAuthorDetails } from "@/src/lib/types";
import { serializePinsWithAuthorDetails } from "@/src/lib/utils/serializers";
import { appendQueryParam } from "@/src/lib/utils/strings";

type FetchFn = (url: string, options?: RequestInit) => Promise<Response>;

type PinsBoardContainerProps = {
  fetchEndpoint: string;
  // The kind of call this board makes. It defaults to a public read, so a board
  // of an authenticated endpoint has to pass 'fetchAuthenticated' from 'useAPI'.
  fetchFn?: FetchFn;
  emptyResultsMessageKey?: string;
  getTapHandlerForPin: ({
    pin,
    pinImageAspectRatio,
  }: {
    pin: PinWithAuthorDetails;
    pinImageAspectRatio: number;
  }) => () => void;
};

const MARGIN_SCROLL_BEFORE_NEW_FETCH = 10000; // the margin we leave ourselves
// in terms of remaining scroll before reaching the end of the board.
// This margin will determine when we trigger the fetching of new pins (see below).

export const DEBOUNCE_TIME_REFRESH_MS = 1000; // after the user just
// refreshed pins, we wait for this timeout before refreshing again and displaying the
// refresh spinner preview again. Otherwise, there is a weird visual effect if the user
// continues scrolling down further than the refresh threshold.

export const DEBOUNCE_TIME_SCROLL_DOWN_TO_FETCH_MORE_PINS_MS = 500; // this debounce
// is introduced to avoid fetching the two next pages instead of just the next
// page when the user scrolls down.

const PinsBoardContainer = ({
  fetchEndpoint,
  fetchFn,
  emptyResultsMessageKey,
  getTapHandlerForPin,
}: PinsBoardContainerProps) => {
  const { t } = useTranslation();

  const queryClient = useQueryClient();

  const resolvedFetchFn: FetchFn = fetchFn ?? fetchPublic;

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasJustRefreshed, setHasJustRefreshed] = useState(false);
  const [refreshError, setRefreshError] = useState("");
  const hasJustFetchedMorePins = useRef(false);

  // The endpoint identifies the board, and a search endpoint carries its search
  // term, so it keys the cache on its own. A change of endpoint therefore reads
  // another cache entry instead of resetting local state.
  const queryKey = ["pinsBoard", fetchEndpoint];

  const fetchPins = async (page: number) => {
    const endpointWithPageParameter = appendQueryParam({
      url: fetchEndpoint,
      key: "page",
      value: page.toString(),
    });

    const response = await resolvedFetchFn(endpointWithPageParameter);

    if (!response.ok) {
      throw new ResponseKOError();
    }

    const responseData = await response.json();

    return serializePinsWithAuthorDetails(responseData.results);
  };

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => fetchPins(pageParam),
    initialPageParam: 1,
    // An empty page means that the board reached its end, so we stop asking for
    // more. Otherwise every scroll to the bottom sends one more empty request.
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === 0 ? undefined : allPages.length + 1,
    retry: false,
  });

  const pins = data?.pages.flat() ?? [];

  const fetchMorePinsError = error ? t("Common.ERROR_FETCH_MORE_PINS") : "";

  // Pull to refresh fetches the first page and writes it as the only page, so
  // the board returns to the top. We fetch it here rather than resetting the
  // query, because resetting drops the loaded pages before the new ones arrive:
  // a refresh that then fails would leave the board empty.
  const onRefresh = async () => {
    setIsRefreshing(true);
    setRefreshError("");

    let firstPins;

    try {
      // Cancel first. A fetch that is still running must not land after us and
      // overwrite the refreshed pins.
      await queryClient.cancelQueries({ queryKey });

      firstPins = await fetchPins(1);
    } catch {
      setRefreshError(t("Common.ERROR_REFRESH_PINS"));
      return;
    } finally {
      setIsRefreshing(false);
      setHasJustRefreshed(true);
      setTimeout(() => {
        setHasJustRefreshed(false);
      }, DEBOUNCE_TIME_REFRESH_MS);
    }

    queryClient.setQueryData<InfiniteData<PinWithAuthorDetails[], number>>(
      queryKey,
      { pages: [firstPins], pageParams: [1] },
    );
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;

    if (offsetY < 0) {
      handlePullEvent(event);
    } else if (offsetY > 0) {
      handleScrollContentEvent(event);
    }
  };

  const handlePullEvent = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetY = event.nativeEvent.contentOffset.y;

    const crossesRefreshThreshold = offsetY < -THRESHOLD_PULL_TO_REFRESH;

    const shouldTriggerRefresh =
      !isRefreshing && !hasJustRefreshed && crossesRefreshThreshold;

    if (shouldTriggerRefresh) {
      onRefresh();
    }
  };

  const handleScrollContentEvent = (
    event: NativeSyntheticEvent<NativeScrollEvent>,
  ) => {
    const offsetY = event.nativeEvent.contentOffset.y;

    const pinsBoardHeight = event.nativeEvent.contentSize.height;

    const crossesScrollThreshold =
      offsetY > pinsBoardHeight - MARGIN_SCROLL_BEFORE_NEW_FETCH;

    const shouldTriggerNextPage =
      !isPending &&
      !isFetchingNextPage &&
      hasNextPage &&
      hasJustFetchedMorePins.current === false &&
      crossesScrollThreshold;

    if (shouldTriggerNextPage) {
      setRefreshError("");

      hasJustFetchedMorePins.current = true;
      setTimeout(() => {
        hasJustFetchedMorePins.current = false;
      }, DEBOUNCE_TIME_SCROLL_DOWN_TO_FETCH_MORE_PINS_MS);

      fetchNextPage();
    }
  };

  return (
    <PinsBoard
      pins={pins}
      isFetchingMorePins={!isRefreshing && (isPending || isFetchingNextPage)}
      fetchMorePinsError={fetchMorePinsError}
      isRefreshing={isRefreshing}
      hasJustRefreshed={hasJustRefreshed}
      refreshError={refreshError}
      emptyResultsMessageKey={emptyResultsMessageKey}
      handleScroll={handleScroll}
      getTapHandlerForPin={getTapHandlerForPin}
    />
  );
};

export default PinsBoardContainer;
