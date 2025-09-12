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
