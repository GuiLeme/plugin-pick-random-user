import { useEffect, useRef, useState } from 'react';
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
  modalTitle: {
    id: 'pickRandomUserPlugin.modal.title',
    description: 'Title of the pick random user modal',
    defaultMessage: 'Pick random user',
  },
  closeButtonAriaLabel: {
    id: 'pickRandomUserPlugin.modal.closeButton.ariaLabel',
    description: 'Aria label for the modal close button',
    defaultMessage: 'Close',
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
    uuid,
  } = props;

  const modalAnchor = useRef(document.getElementById(uuid));

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
      appElement={modalAnchor.current}
      parentSelector={() => document.querySelector('#modals-container')}
      isOpen={showModal}
      onRequestClose={handleCloseAttempt}
      shouldCloseOnOverlayClick={canClose}
      shouldCloseOnEsc={canClose}
    >
      <Styled.ModalHeader>
        <Styled.ModalTitle>
          {intl.formatMessage(intlMessages.modalTitle)}
        </Styled.ModalTitle>
        <Styled.CloseButton
          type="button"
          onClick={handleCloseModal}
          aria-label={intl.formatMessage(intlMessages.closeButtonAriaLabel)}
          data-test="pickRandomUserModalCloseButton"
        >
          <i className="icon-bbb-close" />
        </Styled.CloseButton>
      </Styled.ModalHeader>
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
