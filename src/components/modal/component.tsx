import { useEffect, useState } from 'react';
import * as React from 'react';
import { defineMessages } from 'react-intl';
import { pluginLogger } from 'bigbluebutton-html-plugin-sdk';
import * as Styled from './styles';
import { PickUserModalProps, WindowClientSettings } from './types';
import { PickedUserViewComponent } from './picked-user-view/component';
import { PresenterViewComponent } from './presenter-view/component';
import { hasCurrentUserSeenPickedUser } from '../../commons/utils';

const intlMessages = defineMessages({
  currentUserPicked: {
    id: 'pickRandomUserPlugin.modal.pickedUserView.title.currentUserPicked',
    description: 'Title to show that current user has been picked',
    defaultMessage: 'You have been randomly picked',
  },
});

const TIMEOUT_CLOSE_NOTIFICATION = 5000;

declare const window: WindowClientSettings;

function notifyRandomlyPickedUser(message: string) {
  if (!('Notification' in window)) {
    pluginLogger.warn('This browser does not support notifications');
  } else if (Notification.permission === 'granted') {
    const notification = new Notification(message);
    setTimeout(() => {
      notification.close();
    }, TIMEOUT_CLOSE_NOTIFICATION);
  } else if (Notification.permission !== 'denied') {
    pluginLogger.warn('Browser notification permission has been denied');
  }
}

export function PickUserModal(props: PickUserModalProps) {
  const {
    pickRandomUserSettings,
    intl,
    showModal,
    handleCloseModal,
    users,
    pickedUserWithEntryId,
    handlePickRandomUser,
    currentUser,
    filterOutPresenter,
    setFilterOutPresenter,
    userFilterViewer,
    setUserFilterViewer,
    filterOutPickedUsers,
    setFilterOutPickedUsers,
    dataChannelPickedUsers,
    deletionFunction,
    dispatcherPickedUser,
    pickedUserSeenEntries,
    pushPickedUserSeen,
  } = props;

  const { pingSoundEnabled, pingSoundUrl } = pickRandomUserSettings;
  const [showPresenterView, setShowPresenterView] = useState<boolean>(
    currentUser?.presenter && !pickedUserWithEntryId,
  );

  const [userId, setUserId] = useState(currentUser?.userId || '');

  useEffect(() => {
    // Play audio when user is selected
    const hasCurrentUserSeen = hasCurrentUserSeenPickedUser(
      pickedUserSeenEntries,
      userId,
      pickedUserWithEntryId?.pickedUser?.userId,
    );
    if (pingSoundEnabled && pickedUserWithEntryId
      && pickedUserWithEntryId?.pickedUser?.userId === userId
      // Current user must not have seen this entry and data should be done loading
      && !hasCurrentUserSeen && !pickedUserSeenEntries?.loading) {
      const audio = new Audio(pingSoundUrl);
      audio.play();
      notifyRandomlyPickedUser(intl.formatMessage(intlMessages.currentUserPicked));
    }
  }, [userId, pickedUserWithEntryId, pickedUserSeenEntries]);

  useEffect(() => {
    setShowPresenterView(currentUser?.presenter && !pickedUserWithEntryId);
    if (userId === '') {
      setUserId(currentUser.userId);
    }
  }, [currentUser, pickedUserWithEntryId]);
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
                filterOutPresenter,
                setFilterOutPresenter,
                userFilterViewer,
                setUserFilterViewer,
                filterOutPickedUsers,
                setFilterOutPickedUsers,
                deletionFunction,
                handlePickRandomUser,
                dataChannelPickedUsers,
                pickedUserWithEntryId,
                users,
                dispatcherPickedUser,
              }}
            />
          ) : (
            <PickedUserViewComponent
              {...{
                pickedUserSeenEntries,
                pushPickedUserSeen,
                pickedUserWithEntryId,
                intl,
                currentUser,
                showModal,
                setShowPresenterView,
                dispatcherPickedUser,
              }}
            />
          )

      }
    </Styled.PluginModal>
  );
}
