import { useEffect, useState } from 'react';
import * as React from 'react';
import { defineMessages } from 'react-intl';
import * as Styled from './styles';
import { PickUserModalProps } from './types';
import { PickedUserViewComponent } from './picked-user-view/component';
import { PresenterViewComponent } from './presenter-view/component';
import { useHandleCurrentUserNotification, usePreventCloseModalCountdown } from './hooks';

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

  const [showPresenterView, setShowPresenterView] = useState<boolean>(
    currentUser?.presenter && !currentPickedUser,
  );

  useHandleCurrentUserNotification(
    currentUser,
    pickedUserSeenEntries,
    currentPickedUser,
    pickRandomUserSettings,
    intl.formatMessage(intlMessages.currentUserPicked),
  );

  useEffect(() => {
    setShowPresenterView(currentUser?.presenter && !currentPickedUser);
  }, [currentUser, currentPickedUser]);

  const { remainingSeconds, canClose } = usePreventCloseModalCountdown(
    currentUser,
    pickedUserSeenEntries,
    currentPickedUser,
    pickRandomUserSettings,
  );

  if (!showModal) return null;

  const handleCloseAttempt = () => {
    if (canClose) {
      handleCloseModal();
    }
  };

  const progressPercentage = pickRandomUserSettings.preventCloseDelaySeconds > 0
    ? (remainingSeconds / pickRandomUserSettings.preventCloseDelaySeconds) * 100
    : 0;

  return (
    <Styled.PluginModal
      overlayClassName="modalOverlay"
      portalClassName="modal-low"
      parentSelector={() => document.querySelector('#modals-container')}
      isOpen={showModal}
      onRequestClose={handleCloseAttempt}
      shouldCloseOnOverlayClick={canClose}
      shouldCloseOnEsc={canClose}
    >
      <Styled.CloseButtonWrapper>
        <Styled.CloseButton
          type="button"
          onClick={handleCloseAttempt}
          aria-label="Close button"
          disabled={!canClose}
          style={{
            opacity: canClose ? 1 : 0.5,
            cursor: canClose ? 'pointer' : 'not-allowed',
          }}
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
                remainingSeconds,
                canClose,
                progressPercentage,
              }}
            />
          )

      }
    </Styled.PluginModal>
  );
}
