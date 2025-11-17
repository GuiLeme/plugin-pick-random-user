import * as React from 'react';
import { useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { PickedUserViewComponentProps } from './types';
import * as Styled from './styles';
import { hasCurrentUserSeenPickedUser } from '../../../commons/utils';

const intlMessages = defineMessages({
  currentUserPicked: {
    id: 'pickRandomUserPlugin.modal.pickedUserView.title.currentUserPicked',
    description: 'Title to show that current user has been picked',
    defaultMessage: 'You have been randomly picked',
  },
  randomUserPicked: {
    id: 'pickRandomUserPlugin.modal.pickedUserView.title.randomUserPicked',
    description: 'Title to show that random user has been picked',
    defaultMessage: 'Randomly picked user',
  },
  backButtonLabel: {
    id: 'pickRandomUserPlugin.modal.pickedUserView.backButton.label',
    description: 'Label of back button in picked-user view on the modal',
    defaultMessage: 'back',
  },
  avatarImageAlternativeText: {
    id: 'pickRandomUserPlugin.modal.pickedUserView.avatarImage.alternativeText',
    description: 'Alternative text for avatar image',
    defaultMessage: 'Avatar image of user {0}',
  },
  modalCloseDelayMessage: {
    id: 'pickRandomUserPlugin.modal.closeDelayMessage',
    description: 'Message showing countdown before modal can be closed',
    defaultMessage: 'You can close this modal in {seconds} seconds',
  },
  modalCloseDelayMessageSingular: {
    id: 'pickRandomUserPlugin.modal.closeDelayMessageSingular',
    description: 'Message showing countdown before modal can be closed (singular)',
    defaultMessage: 'You can close this modal in {seconds} second',
  },
});


export function PickedUserViewComponent(props: PickedUserViewComponentProps) {
  const {
    intl,
    pickedUserWithEntryId,
    currentUser,
    setShowPresenterView,
    pickedUserSeenEntries,
    pushPickedUserSeen,
    remainingSeconds,
    canClose,
    progressPercentage,
  } = props;

  

  const handleBackToPresenterView = () => {
    if (currentUser?.presenter) {
      setShowPresenterView(true);
    }
  };
  const avatarUrl = pickedUserWithEntryId?.pickedUser?.avatar;

  useEffect(() => {
    const hasCurrentUserSeen = hasCurrentUserSeenPickedUser(
      pickedUserSeenEntries,
      currentUser?.userId,
      pickedUserWithEntryId?.pickedUser?.userId,
    );
    if (pickedUserWithEntryId && !hasCurrentUserSeen) {
      pushPickedUserSeen({
        pickedUserId: pickedUserWithEntryId?.pickedUser.userId,
        seenByUserId: currentUser.userId,
      });
    }
  }, [pickedUserWithEntryId]);
  const title = (pickedUserWithEntryId?.pickedUser?.userId === currentUser?.userId)
    ? intl.formatMessage(intlMessages.currentUserPicked)
    : intl.formatMessage(intlMessages.randomUserPicked);

  const avatarAltDescriptor = intl.formatMessage(intlMessages.currentUserPicked, {
    0: pickedUserWithEntryId?.pickedUser?.name,
  });

  return (
    <Styled.PickedUserViewWrapper>
      <Styled.PickedUserViewTitle>{title}</Styled.PickedUserViewTitle>
      {
        (pickedUserWithEntryId) ? (
          <>
            {avatarUrl ? (
              <Styled.PickedUserAvatarImage
                alt={avatarAltDescriptor}
                src={avatarUrl}
              />
            ) : (
              <Styled.PickedUserAvatarInitials
                background={pickedUserWithEntryId?.pickedUser?.color}
              >
                {pickedUserWithEntryId?.pickedUser?.name.slice(0, 2)}
              </Styled.PickedUserAvatarInitials>
            )}
            <Styled.PickedUserName>{pickedUserWithEntryId?.pickedUser?.name}</Styled.PickedUserName>
          </>
        ) : null
      }
      {!canClose && remainingSeconds > 0 && !currentUser?.presenter && (
        <Styled.CountdownMessage>
          {intl.formatMessage(
            remainingSeconds === 1
              ? intlMessages.modalCloseDelayMessageSingular
              : intlMessages.modalCloseDelayMessage,
            { seconds: Math.ceil(remainingSeconds) },
          )}
        </Styled.CountdownMessage>
      )}
      {
        (currentUser?.presenter) ? (
          <Styled.BackButton type="button" onClick={handleBackToPresenterView}>
            {intl.formatMessage(intlMessages.backButtonLabel)}
          </Styled.BackButton>
        ) : null
      }
      {!canClose && remainingSeconds > 0 && currentUser?.presenter && (
        <Styled.CountdownBarContainer>
          <Styled.CountdownBar progress={progressPercentage} />
        </Styled.CountdownBarContainer>
      )}
    </Styled.PickedUserViewWrapper>
  );
}
