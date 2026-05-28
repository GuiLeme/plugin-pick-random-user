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
});

export function PickedUserViewComponent(props: PickedUserViewComponentProps) {
  const {
    intl,
    pickedUserWithEntryId,
    currentUser,
    setShowPresenterView,
    pickedUserSeenEntries,
    pushPickedUserSeen,
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
  const avatarAltDescriptor = intl.formatMessage(intlMessages.avatarImageAlternativeText, {
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
      </Styled.PickedUserViewBody>
      {currentUser?.presenter && (
        <Styled.PickedUserViewFooter>
          <Styled.BackButton type="button" data-test="pickRandomUserBackButton" onClick={handleBackToPresenterView}>
            {intl.formatMessage(intlMessages.backButtonLabel)}
          </Styled.BackButton>
        </Styled.PickedUserViewFooter>
      )}
    </Styled.PickedUserViewWrapper>
  );
}
