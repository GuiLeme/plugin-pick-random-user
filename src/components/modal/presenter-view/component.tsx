import * as React from 'react';
import { RESET_DATA_CHANNEL } from 'bigbluebutton-html-plugin-sdk';
import { DataChannelEntryResponseType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/types';
import { defineMessages } from 'react-intl';
import { useContext } from 'react';

import * as Styled from './styles';
import { PickedUser } from '../../pick-random-user/types';
import { PresenterViewComponentProps } from './types';
import { FilterOptionsContext } from '../../pick-random-user/context';

const intlMessages = defineMessages({
  optionsTitle: {
    id: 'pickRandomUserPlugin.modal.presenterView.optionSection.title',
    description: 'Title of the options section on modal`s presenter view',
    defaultMessage: 'Options',
  },
  includeModeratorsLabel: {
    id: 'pickRandomUserPlugin.modal.presenterView.optionSection.includeModeratorsLabel',
    description: 'Label to include moderator`s option on modal`s presenter view',
    defaultMessage: 'Include moderators',
  },
  includePresenterLabel: {
    id: 'pickRandomUserPlugin.modal.presenterView.optionSection.includePresenterLabel',
    description: 'Label of skip presenter`s option on modal`s presenter view',
    defaultMessage: 'Include presenter',
  },
  includePickedUsersLabel: {
    id: 'pickRandomUserPlugin.modal.presenterView.optionSection.includePickedUsersLabel',
    description: 'Label of include picked users option on modal`s presenter view',
    defaultMessage: 'Include already picked users',
  },
  availableTitle: {
    id: 'pickRandomUserPlugin.modal.presenterView.availableSection.title',
    description: 'Title of the "available users" section on modal`s presenter view',
    defaultMessage: 'Available for selection',
  },
  userLabel: {
    id: 'pickRandomUserPlugin.modal.presenterView.availableSection.userLabel',
    description: 'Label to count user in "available users" section on presenter view',
    defaultMessage: 'user',
  },
  userLabelPlural: {
    id: 'pickRandomUserPlugin.modal.presenterView.availableSection.userLabelPlural',
    description: 'Label to count users in "available users" section on presenter view',
    defaultMessage: 'users',
  },
  viewerLabel: {
    id: 'pickRandomUserPlugin.modal.presenterView.availableSection.viewerLabel',
    description: 'Label to count viewer in "available users" section on presenter view',
    defaultMessage: 'viewer',
  },
  viewerLabelPlural: {
    id: 'pickRandomUserPlugin.modal.presenterView.availableSection.viewerLabelPlural',
    description: 'Label to count viewers in "available users" section on presenter view',
    defaultMessage: 'viewers',
  },
  previouslyPickedTitle: {
    id: 'pickRandomUserPlugin.modal.presenterView.previouslyPickedSection.title',
    description: 'Title of the "previously picked" section on presenter view',
    defaultMessage: 'Previously picked',
  },
  clearButtonLabel: {
    id: 'pickRandomUserPlugin.modal.presenterView.previouslyPickedSection.clearButtonLabel',
    description: 'Label of button to clear list of already picked users',
    defaultMessage: 'Clear All',
  },
  noUsersWarning: {
    id: 'pickRandomUserPlugin.modal.presenterView.previouslyPickedSection.noUsersWarning',
    description: 'Warning that there is no user to be picked',
    defaultMessage: 'No {0} available to randomly pick from',
  },
  pickButtonLabel: {
    id: 'pickRandomUserPlugin.modal.presenterView.previouslyPickedSection.pickButtonLabel.pickUser',
    description: 'Label of the button to pick another user',
    defaultMessage: 'Pick {0}',
  },
  pickAgainButtonLabel: {
    id: 'pickRandomUserPlugin.modal.presenterView.previouslyPickedSection.pickButtonLabel.pickAgain',
    description: 'Label of the button to pick another user',
    defaultMessage: 'Pick again',
  },
  emptyState: {
    id: 'pickRandomUserPlugin.modal.presenterView.previouslyPickedSection.emptyState',
    description: 'Empty state text shown when no user has been picked yet',
    defaultMessage: 'No user selected yet',
  },
  availableEmptyState: {
    id: 'pickRandomUserPlugin.modal.presenterView.availableSection.emptyState',
    description: 'Empty state text shown when no user is available for selection',
    defaultMessage: 'No {0} available for selection',
  },
  moderatorRoleLabel: {
    id: 'pickRandomUserPlugin.modal.presenterView.roleLabel.moderator',
    description: 'Role badge label for moderators',
    defaultMessage: 'moderator',
  },
  presenterRoleLabel: {
    id: 'pickRandomUserPlugin.modal.presenterView.roleLabel.presenter',
    description: 'Role badge label for presenters',
    defaultMessage: 'presenter',
  },
});

const FALLBACK_AVATAR_COLORS = ['#4E7FF8', '#2BA084', '#E07A3A', '#7B61D9', '#D4733B'];

function getAvatarColorFallback(name: string): string {
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return FALLBACK_AVATAR_COLORS[hash % FALLBACK_AVATAR_COLORS.length];
}

function getInitials(name: string): string {
  return name.slice(0, 2);
}

function ShieldIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
    </svg>
  );
}

function PresentationIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h5l-2 3v1h8v-1l-2-3h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 12H5V5h14v10z" />
    </svg>
  );
}

function UserCheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
      <path d="M9 12c2.7 0 4-1.34 4-4 0-2.21-1.34-4-4-4S5 5.79 5 8c0 2.66 1.3 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm8-2l-1.41 1.41 3 3L22 12l-1.41-1.41-2.59 2.59L17 14z" />
    </svg>
  );
}

function makePickedUserRows(list?: DataChannelEntryResponseType<PickedUser>[]) {
  return list?.filter((u) => !!u.payloadJson).map((u) => {
    const time = new Date(u.createdAt);
    const { avatar, color, name } = u.payloadJson;
    const initials = getInitials(name);
    return (
      <Styled.PickedUserRow key={`${u.payloadJson.userId}-${time.getTime()}`}>
        {avatar ? (
          <Styled.UserAvatarImage src={avatar} alt={name} />
        ) : (
          <Styled.UserAvatar $color={color || getAvatarColorFallback(name)}>
            {initials}
          </Styled.UserAvatar>
        )}
        <Styled.UserNameText>{name}</Styled.UserNameText>
      </Styled.PickedUserRow>
    );
  });
}

export function PresenterViewComponent(props: PresenterViewComponentProps) {
  const {
    intl,
    deletionFunction,
    handlePickRandomUser,
    dataChannelPickedUsers,
    pickedUserWithEntryId,
    users,
  } = props;

  const { filterOptions, setFilterOptions } = useContext(FilterOptionsContext);
  const { includeModerators, includePresenter, includePickedUsers } = filterOptions;

  const usersCount = users?.length ?? 0;
  const userRoleLabel = (() => {
    if (!includeModerators) {
      return usersCount !== 1
        ? intl.formatMessage(intlMessages.viewerLabelPlural, { 0: usersCount })
        : intl.formatMessage(intlMessages.viewerLabel, { 0: usersCount });
    }
    return usersCount !== 1
      ? intl.formatMessage(intlMessages.userLabelPlural, { 0: usersCount })
      : intl.formatMessage(intlMessages.userLabel, { 0: usersCount });
  })();

  const userRoleLabelSingular = (!includeModerators)
    ? intl.formatMessage(intlMessages.viewerLabel, { 0: usersCount })
    : intl.formatMessage(intlMessages.userLabel, { 0: usersCount });

  const hasPickedUsers = dataChannelPickedUsers?.some((u) => !!u.payloadJson);

  return (
    <Styled.PresenterViewWrapper>
      <Styled.ContentPadding>

        {/* OPTIONS SECTION */}
        <Styled.OptionsSection>
          <Styled.SectionLabel>
            {intl.formatMessage(intlMessages.optionsTitle)}
          </Styled.SectionLabel>
          <Styled.OptionsContainer>
            <Styled.ToggleRow htmlFor="includeModerators">
              <Styled.ToggleRowLeft>
                <Styled.IconCircle>
                  <ShieldIcon />
                </Styled.IconCircle>
                <Styled.ToggleLabelText>
                  {intl.formatMessage(intlMessages.includeModeratorsLabel)}
                </Styled.ToggleLabelText>
              </Styled.ToggleRowLeft>
              <Styled.ToggleCheckbox
                id="includeModerators"
                type="checkbox"
                checked={includeModerators}
                onChange={() => {
                  setFilterOptions((prev) => ({
                    ...prev,
                    includeModerators: !prev.includeModerators,
                  }));
                }}
              />
            </Styled.ToggleRow>

            <Styled.ToggleRow htmlFor="includePresenter">
              <Styled.ToggleRowLeft>
                <Styled.IconCircle>
                  <PresentationIcon />
                </Styled.IconCircle>
                <Styled.ToggleLabelText>
                  {intl.formatMessage(intlMessages.includePresenterLabel)}
                </Styled.ToggleLabelText>
              </Styled.ToggleRowLeft>
              <Styled.ToggleCheckbox
                id="includePresenter"
                type="checkbox"
                checked={includePresenter}
                onChange={() => {
                  setFilterOptions((prev) => ({
                    ...prev,
                    includePresenter: !prev.includePresenter,
                  }));
                }}
              />
            </Styled.ToggleRow>

            <Styled.ToggleRow htmlFor="includePickedUsers">
              <Styled.ToggleRowLeft>
                <Styled.IconCircle>
                  <UserCheckIcon />
                </Styled.IconCircle>
                <Styled.ToggleLabelText>
                  {intl.formatMessage(intlMessages.includePickedUsersLabel)}
                </Styled.ToggleLabelText>
              </Styled.ToggleRowLeft>
              <Styled.ToggleCheckbox
                id="includePickedUsers"
                type="checkbox"
                checked={includePickedUsers}
                onChange={() => {
                  setFilterOptions((prev) => ({
                    ...prev,
                    includePickedUsers: !prev.includePickedUsers,
                  }));
                }}
              />
            </Styled.ToggleRow>
          </Styled.OptionsContainer>
        </Styled.OptionsSection>

        {/* AVAILABLE USERS SECTION */}
        <Styled.AvailableSection>
          <Styled.SectionHeaderRow data-test="pickRandomUserAvailableContent">
            <Styled.SectionLabel>
              {intl.formatMessage(intlMessages.availableTitle)}
            </Styled.SectionLabel>
            <Styled.CountBadge>
              {usersCount}
              {' '}
              {userRoleLabel}
            </Styled.CountBadge>
          </Styled.SectionHeaderRow>
          {usersCount === 0 ? (
            <Styled.EmptyStateContainer>
              <Styled.EmptyStateText>
                {intl.formatMessage(intlMessages.availableEmptyState, { 0: userRoleLabel })}
              </Styled.EmptyStateText>
            </Styled.EmptyStateContainer>
          ) : (
            <Styled.UserListContainer>
              {users?.map((user) => {
                const initials = getInitials(user.name);
                let roleBadgeLabel: string | null = null;
                if (user.role === 'MODERATOR') {
                  roleBadgeLabel = intl.formatMessage(intlMessages.moderatorRoleLabel);
                } else if (user.presenter) {
                  roleBadgeLabel = intl.formatMessage(intlMessages.presenterRoleLabel);
                }
                return (
                  <Styled.UserRow key={user.userId}>
                    {user.avatar ? (
                      <Styled.UserAvatarImage src={user.avatar} alt={user.name} />
                    ) : (
                      <Styled.UserAvatar $color={user.color || getAvatarColorFallback(user.name)}>
                        {initials}
                      </Styled.UserAvatar>
                    )}
                    <Styled.UserNameText>{user.name}</Styled.UserNameText>
                    {roleBadgeLabel && (
                      <Styled.RoleBadge>{roleBadgeLabel}</Styled.RoleBadge>
                    )}
                  </Styled.UserRow>
                );
              })}
            </Styled.UserListContainer>
          )}
        </Styled.AvailableSection>

        {/* PREVIOUSLY PICKED SECTION */}
        <Styled.PreviouslyPickedSection>
          <Styled.SectionHeaderRow>
            <Styled.SectionLabel>
              {intl.formatMessage(intlMessages.previouslyPickedTitle)}
            </Styled.SectionLabel>
            <Styled.ClearAllButton
              type="button"
              data-test="pickRandomUserClearAllButton"
              onClick={() => deletionFunction([RESET_DATA_CHANNEL])}
            >
              {intl.formatMessage(intlMessages.clearButtonLabel)}
            </Styled.ClearAllButton>
          </Styled.SectionHeaderRow>
          {hasPickedUsers ? (
            <Styled.PickedUserListContainer>
              <Styled.PickedList data-test="pickRandomUserPreviouslyPickedList">
                {makePickedUserRows(dataChannelPickedUsers)}
              </Styled.PickedList>
            </Styled.PickedUserListContainer>
          ) : (
            <>
              <Styled.EmptyStateContainer>
                <Styled.EmptyStateText>
                  {intl.formatMessage(intlMessages.emptyState)}
                </Styled.EmptyStateText>
              </Styled.EmptyStateContainer>
              {/* Empty list kept in DOM so [data-test] li selectors resolve correctly */}
              <Styled.PickedList data-test="pickRandomUserPreviouslyPickedList" />
            </>
          )}
        </Styled.PreviouslyPickedSection>

      </Styled.ContentPadding>

      {/* FOOTER */}
      <Styled.FooterContainer>
        {usersCount > 0 ? (
          <Styled.PickButton
            type="button"
            data-test="pickRandomUserPickButton"
            onClick={handlePickRandomUser}
          >
            {pickedUserWithEntryId
              ? intl.formatMessage(intlMessages.pickAgainButtonLabel)
              : intl.formatMessage(intlMessages.pickButtonLabel, { 0: userRoleLabelSingular })}
          </Styled.PickButton>
        ) : (
          <Styled.NoUsersWarning data-test="pickRandomUserNoUsersWarning">
            {intl.formatMessage(intlMessages.noUsersWarning, { 0: userRoleLabel })}
          </Styled.NoUsersWarning>
        )}
      </Styled.FooterContainer>
    </Styled.PresenterViewWrapper>
  );
}
