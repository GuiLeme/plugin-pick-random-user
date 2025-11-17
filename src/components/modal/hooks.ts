import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { CurrentUserData, DataChannelEntryResponseType, GraphqlResponseWrapper } from 'bigbluebutton-html-plugin-sdk';
import { PickedUserSeenEntryDataChannel, PickedUserWithEntryId } from '../pick-random-user/types';
import { PickRandomUserSettings } from '../../commons/types';
import { notifyRandomlyPickedUser, pingSoundForRandomlyPickedUser } from './utils';
import { usePreviousValue } from '../../commons/hooks';
import { hasCurrentUserSeenPickedUser } from '../../commons/utils';

const UPDATE_COUNTDOWN_RATE = 100; // milliseconds
const COUNTDOWN_RATE_IN_SECONDS = UPDATE_COUNTDOWN_RATE / 1000;

const useCurrentUserId = (currentUser: CurrentUserData) => {
  const [currentUserId, setCurrentUserId] = useState(currentUser?.userId || '');

  useEffect(() => {
    if (currentUserId === '') {
      setCurrentUserId(currentUser.userId);
    }
  }, [currentUser]);

  return currentUserId;
};

export const useObserveForNotification = (
  notifyAndPingCallback: () => void,
  currentUser: CurrentUserData,
  pickedUserSeenEntries: GraphqlResponseWrapper<
    DataChannelEntryResponseType<PickedUserSeenEntryDataChannel>[]>,
  currentPickedUser: PickedUserWithEntryId,
) => {
  const currentUserId = useCurrentUserId(currentUser);

  const [shouldNotify, setShouldNotify] = useState(false);

  const previousPickedUserEntryId = usePreviousValue(currentPickedUser?.entryId);

  const currentPickedUserId = currentPickedUser?.pickedUser?.userId;

  useEffect(() => {
    if (currentPickedUser
      && currentPickedUserId === currentUserId
      && previousPickedUserEntryId !== currentPickedUser.entryId
    ) {
      setShouldNotify(true);
    }
  }, [currentUserId, currentPickedUser]);

  useEffect(() => {
    const hasCurrentUserSeen = hasCurrentUserSeenPickedUser(
      pickedUserSeenEntries,
      currentUserId,
      currentPickedUser?.pickedUser.userId,
    );
    const notifyUser = !pickedUserSeenEntries?.loading && !hasCurrentUserSeen && shouldNotify;
    if (notifyUser) {
      notifyAndPingCallback();
    }
    setShouldNotify(false);
  }, [
    shouldNotify,
  ]);
};

export const useHandleCurrentUserNotification = (
  currentUser: CurrentUserData,
  pickedUserSeenEntries: GraphqlResponseWrapper<
    DataChannelEntryResponseType<PickedUserSeenEntryDataChannel>[]>,
  currentPickedUser: PickedUserWithEntryId,
  pickRandomUserSettings: PickRandomUserSettings,
  notificationMessage: string,
) => {
  const { pingSoundEnabled, pingSoundUrl, browserNotificationEnabled } = pickRandomUserSettings;

  function notifyAndPing() {
    if (pingSoundEnabled) pingSoundForRandomlyPickedUser(pingSoundUrl);
    if (browserNotificationEnabled) {
      notifyRandomlyPickedUser(
        notificationMessage,
      );
    }
  }

  useObserveForNotification(
    notifyAndPing,
    currentUser,
    pickedUserSeenEntries,
    currentPickedUser,
  );
};

export const usePreventCloseModalCountdown = (
  currentUser: CurrentUserData,
  pickedUserSeenEntries: GraphqlResponseWrapper<
    DataChannelEntryResponseType<PickedUserSeenEntryDataChannel>[]>,
  currentPickedUser: PickedUserWithEntryId,
  pickRandomUserSettings: PickRandomUserSettings,
) => {
  const { preventCloseDelaySeconds } = pickRandomUserSettings;

  const [remainingSeconds, setRemainingSeconds] = useState<number>(preventCloseDelaySeconds);
  const [canClose, setCanClose] = useState<boolean>(true);
  const intervalInstanceRef = useRef<NodeJS.Timeout | null>(null);

  const currentUserSeenPickedUser: boolean = useMemo(
    () => hasCurrentUserSeenPickedUser(
      pickedUserSeenEntries,
      currentUser.userId,
      currentPickedUser?.pickedUser.userId,
    ),
    [pickedUserSeenEntries, currentPickedUser, preventCloseDelaySeconds],
  );

  const stopCountdown = (interval: NodeJS.Timeout) => {
    intervalInstanceRef.current = null;
    clearInterval(interval);
    setCanClose(true);
  };

  const handleCountdownTick = (interval: NodeJS.Timeout) => {
    setRemainingSeconds((prev) => {
      const newValue = prev - COUNTDOWN_RATE_IN_SECONDS;
      if (newValue >= 0) {
        return newValue;
      }
      stopCountdown(interval);
      return 0;
    });
  };

  const startCountdown = () => {
    setCanClose(false);
    const interval = setInterval(() => {
      handleCountdownTick(interval);
    }, UPDATE_COUNTDOWN_RATE);
    intervalInstanceRef.current = interval;
  };

  const resetCountdown = () => {
    setRemainingSeconds(preventCloseDelaySeconds);
    if (intervalInstanceRef.current) {
      clearInterval(intervalInstanceRef.current);
    }
    if (preventCloseDelaySeconds > 0) {
      startCountdown();
    }
  };

  useEffect(() => {
    if (!currentUserSeenPickedUser && currentPickedUser) {
      resetCountdown();
    } else if (!currentPickedUser) stopCountdown(intervalInstanceRef.current);
  }, [currentUserSeenPickedUser, currentPickedUser]);

  return { remainingSeconds, canClose };
};
