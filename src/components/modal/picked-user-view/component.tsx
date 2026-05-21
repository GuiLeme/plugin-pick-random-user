import * as React from 'react';
import { useEffect } from 'react';
import { defineMessages } from 'react-intl';
import { PickedUserViewComponentProps } from './types';
import * as Styled from './styles';
import { hasCurrentUserSeenPickedUser } from '../../../commons/utils';

const intlMessages = defineMessages({
  resultSectionLabel: {
    id: 'pickRandomUserPlugin.modal.pickedUserView.resultSectionLabel',
    description: 'Section label shown above the picked user result',
    defaultMessage: 'Result',
  },
  currentUserPicked: {
    id: 'pickRandomUserPlugin.modal.pickedUserView.title.currentUserPicked',
    description: 'Title to show that current user has been picked',
    defaultMessage: 'You have been randomly picked',
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
  const avatarAltDescriptor = intl.formatMessage(intlMessages.currentUserPicked, {
    0: pickedUserWithEntryId?.pickedUser?.name,
  });

  return (
    <Styled.PickedUserViewWrapper>
      <Styled.PickedUserViewBody>
        <Styled.ResultSectionLabel data-test="pickRandomUserPickedUserViewTitle">
          {intl.formatMessage(intlMessages.resultSectionLabel)}
        </Styled.ResultSectionLabel>
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
              <Styled.PickedUserName data-test="pickRandomUserPickedUserName">{pickedUserWithEntryId?.pickedUser?.name}</Styled.PickedUserName>
            </>
          ) : null
        }
        {!canClose && remainingSeconds > 0 && !currentUser?.presenter && (
          <Styled.CountdownMessage
            data-test="countDownMessage"
          >
            {intl.formatMessage(
              remainingSeconds === 1
                ? intlMessages.modalCloseDelayMessageSingular
                : intlMessages.modalCloseDelayMessage,
              { seconds: Math.ceil(remainingSeconds) },
            )}
          </Styled.CountdownMessage>
        )}
      </Styled.PickedUserViewBody>
      {currentUser?.presenter && (
        <Styled.PickedUserViewFooter>
          <Styled.BackButton type="button" data-test="pickRandomUserBackButton" onClick={handleBackToPresenterView}>
            {intl.formatMessage(intlMessages.backButtonLabel)}
          </Styled.BackButton>
          {!canClose && remainingSeconds > 0 && (
            <Styled.CountdownBarContainer>
              <Styled.CountdownBar
                data-test="countDownProgressBar"
                progress={progressPercentage}
              />
            </Styled.CountdownBarContainer>
          )}
        </Styled.PickedUserViewFooter>
      )}
    </Styled.PickedUserViewWrapper>
  );
}
