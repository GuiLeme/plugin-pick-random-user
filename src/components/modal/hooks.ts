import { useEffect, useState } from 'react';
import { CurrentUserData, DataChannelEntryResponseType, GraphqlResponseWrapper } from 'bigbluebutton-html-plugin-sdk';
import { PickedUserSeenEntryDataChannel, PickedUserWithEntryId } from '../pick-random-user/types';
import { PickRandomUserSettings } from '../../commons/types';
import { notifyRandomlyPickedUser, pingSoundForRandomlyPickedUser } from './utils';
import { usePreviousValue } from '../../commons/hooks';
import { hasCurrentUserSeenPickedUser } from '../../commons/utils';

const useCurrentUserId = (currentUser: CurrentUserData) => {
  const [currentUserId, setCurrentUserId] = useState(currentUser?.userId || '');

  useEffect(() => {
    if (currentUserId === '') {
      setCurrentUserId(currentUser.userId);
    }
  }, [currentUser]);

  return currentUserId;
};

export const useRunWhenNeedNotification = (
  notifyAndPingCallback: () => void,
  currentUser: CurrentUserData,
  pickedUserSeenEntries: GraphqlResponseWrapper<
    DataChannelEntryResponseType<PickedUserSeenEntryDataChannel>[]>,
  currentPickedUser: PickedUserWithEntryId,
) => {
  const currentUserId = useCurrentUserId(currentUser);

  const [notificationRequestQueue, setNotificationRequestQueue] = useState<Set<string>>(new Set());

  const previousPickedUserEntryId = usePreviousValue(currentPickedUser?.entryId);

  const currentPickedUserId = currentPickedUser?.pickedUser?.userId;

  useEffect(() => {
    if (currentPickedUser
      && currentPickedUserId === currentUserId
      && previousPickedUserEntryId !== currentPickedUser.entryId
    ) {
      setNotificationRequestQueue((prevQueue) => {
        const newQueue = new Set(prevQueue);
        newQueue.add(currentPickedUser.entryId);
        return newQueue;
      });
    }
  }, [currentUserId, currentPickedUser]);

  useEffect(() => {
    Array.from(notificationRequestQueue).filter(
      (notificationRequest) => notificationRequest === currentPickedUser?.entryId,
    ).filter(() => {
      const hasCurrentUserSeen = hasCurrentUserSeenPickedUser(
        pickedUserSeenEntries,
        currentUserId,
        currentPickedUser?.pickedUser.userId,
      );
      return !hasCurrentUserSeen;
    }).forEach((notificationRequest) => {
      notifyAndPingCallback();
      setNotificationRequestQueue((previousNotificationRequests) => {
        const newQueue = new Set(previousNotificationRequests);
        newQueue.delete(notificationRequest);
        return newQueue;
      });
    });
  }, [
    notificationRequestQueue,
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

  useRunWhenNeedNotification(
    notifyAndPing,
    currentUser,
    pickedUserSeenEntries,
    currentPickedUser,
  );
};
