import { useEffect, useState } from 'react';
import { CurrentUserData, DataChannelEntryResponseType, GraphqlResponseWrapper } from 'bigbluebutton-html-plugin-sdk';
import { hasCurrentUserSeenPickedUser } from '../../commons/utils';
import { PickedUserSeenEntryDataChannel, PickedUserWithEntryId } from '../pick-random-user/types';
import { PickRandomUserSettings } from '../../commons/types';
import { notifyRandomlyPickedUser, pingSoundForRandomlyPickedUser } from './utils';

const useCurrentUserId = (currentUser: CurrentUserData) => {
  const [currentUserId, setCurrentUserId] = useState(currentUser?.userId || '');

  useEffect(() => {
    if (currentUserId === '') {
      setCurrentUserId(currentUser.userId);
    }
  }, [currentUser]);

  return currentUserId;
};

export const useHandleCurrentUserNotification = (
  currentUser: CurrentUserData,
  pickedUserSeenEntries: GraphqlResponseWrapper<
    DataChannelEntryResponseType<PickedUserSeenEntryDataChannel>[]>,
  currentPickedUser: PickedUserWithEntryId,
  pickRandomUserSettings: PickRandomUserSettings,
  notificationMessage: string,
) => {
  const currentUserId = useCurrentUserId(currentUser);

  const { pingSoundEnabled, pingSoundUrl, browserNotificationEnabled } = pickRandomUserSettings;

  const [currentUserNotified, setCurrentUserNotified] = useState(false);

  const currentPickedUserId = currentPickedUser?.pickedUser?.userId;

  // Control internal state of user-notification to not rely only on data-channel information
  useEffect(() => {
    const hasCurrentUserSeen = hasCurrentUserSeenPickedUser(
      pickedUserSeenEntries,
      currentUserId,
      currentPickedUserId,
    );
    if (hasCurrentUserSeen) {
      setCurrentUserNotified(false);
    }
  }, [pickedUserSeenEntries]);

  // Notify or ping audio (or both) when user is selected
  useEffect(() => {
    const hasCurrentUserSeen = hasCurrentUserSeenPickedUser(
      pickedUserSeenEntries,
      currentUserId,
      currentPickedUserId,
    );
    if (currentPickedUser
      && currentPickedUserId === currentUserId
      // Current user must not have seen this entry and data should be done loading
      && !hasCurrentUserSeen && !pickedUserSeenEntries?.loading
      && !currentUserNotified
    ) {
      if (pingSoundEnabled) pingSoundForRandomlyPickedUser(pingSoundUrl);
      if (browserNotificationEnabled) {
        notifyRandomlyPickedUser(
          notificationMessage,
        );
      }
      setCurrentUserNotified(true);
    }
  }, [currentUserId, currentPickedUser, pickedUserSeenEntries, pickRandomUserSettings]);
};
