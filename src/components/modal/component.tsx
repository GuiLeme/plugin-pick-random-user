import { useEffect, useState } from 'react';
import * as React from 'react';
import { defineMessages } from 'react-intl';
import * as Styled from './styles';
import { PickUserModalProps } from './types';
import { PickedUserViewComponent } from './picked-user-view/component';
import { PresenterViewComponent } from './presenter-view/component';
import { hasCurrentUserSeenPickedUser } from '../../commons/utils';
import { notifyRandomlyPickedUser, pingSoundForRandomlyPickedUser } from './utils';

const intlMessages = defineMessages({
  currentUserPicked: {
    id: 'pickRandomUserPlugin.modal.pickedUserView.title.currentUserPicked',
    description: 'Title to show that current user has been picked',
    defaultMessage: 'You have been randomly picked',
  },
});

export function PickUserModal(props: PickUserModalProps) {
  const {
    pickRandomUserSettings,
    intl,
    showModal,
    handleCloseModal,
    users,
    currentPickedUser,
    handlePickRandomUser,
    currentUser,
    dataChannelPickedUsers,
    deletionFunction,
    pickedUserSeenEntries,
    pushPickedUserSeen,
  } = props;

  const { pingSoundEnabled, pingSoundUrl, browserNotificationEnabled } = pickRandomUserSettings;
  const [showPresenterView, setShowPresenterView] = useState<boolean>(
    currentUser?.presenter && !currentPickedUser,
  );

  const [userId, setUserId] = useState(currentUser?.userId || '');

  useEffect(() => {
    // Play audio when user is selected
    const hasCurrentUserSeen = hasCurrentUserSeenPickedUser(
      pickedUserSeenEntries,
      userId,
      currentPickedUser?.pickedUser?.userId,
    );
    if (currentPickedUser
      && currentPickedUser?.pickedUser?.userId === userId
      // Current user must not have seen this entry and data should be done loading
      && !hasCurrentUserSeen && !pickedUserSeenEntries?.loading) {
      if (pingSoundEnabled) pingSoundForRandomlyPickedUser(pingSoundUrl);
      if (browserNotificationEnabled) {
        notifyRandomlyPickedUser(
          intl.formatMessage(intlMessages.currentUserPicked),
        );
      }
    }
  }, [userId, currentPickedUser, pickedUserSeenEntries]);

  useEffect(() => {
    setShowPresenterView(currentUser?.presenter && !currentPickedUser);
    if (userId === '') {
      setUserId(currentUser.userId);
    }
  }, [currentUser, currentPickedUser]);
  return (
    <Styled.PluginModal
      overlayClassName="modalOverlay"
      isOpen={showModal}
      onRequestClose={handleCloseModal}
    >
      <Styled.CloseButtonWrapper>
        <Styled.CloseButton
          type="button"
          onClick={() => {
            handleCloseModal();
          }}
          aria-label="Close button"
        >
          <i
            className="icon-bbb-close"
          />
        </Styled.CloseButton>
      </Styled.CloseButtonWrapper>
      {
        showPresenterView
          ? (
            <PresenterViewComponent
              {...{
                intl,
                deletionFunction,
                handlePickRandomUser,
                dataChannelPickedUsers,
                pickedUserWithEntryId: currentPickedUser,
                users,
              }}
            />
          ) : (
            <PickedUserViewComponent
              {...{
                pickedUserSeenEntries,
                pushPickedUserSeen,
                pickedUserWithEntryId: currentPickedUser,
                intl,
                currentUser,
                showModal,
                setShowPresenterView,
              }}
            />
          )

      }
    </Styled.PluginModal>
  );
}
