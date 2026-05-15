import styled from 'styled-components';

// ── Section labels ────────────────────────────────────────────────────────────

const SectionLabel = styled.span`
  font-size: 0.6875rem;
  font-weight: 600;
  color: #8B9AAF;
  text-transform: uppercase;
  letter-spacing: 0.6px;
`;

// ── Options section (toggle rows) ─────────────────────────────────────────────

const OptionsContainer = styled.div`
  margin-top: 0.5rem;
`;

const ToggleRow = styled.label`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4375rem 0;
  cursor: pointer;
  border-bottom: 1px solid #F2F4F7;

  &:last-child {
    border-bottom: none;
  }
`;

const ToggleRowLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const IconCircle = styled.span`
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: #EEF2F8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #4E7FF8;
`;

const ToggleLabelText = styled.span`
  font-size: 1rem;
  color: #1C2B3A;
`;

// Checkbox styled as a toggle switch.
// Keeps the real <input type="checkbox"> in the DOM so Playwright selectors
// (#includeModerators etc.) and isChecked() / toBeVisible() all keep working.
const ToggleCheckbox = styled.input`
  appearance: none;
  -webkit-appearance: none;
  width: 2.25rem;
  height: 1.25rem;
  border-radius: 0.625rem;
  background: #D1D9E3;
  cursor: pointer;
  outline: none;
  border: none;
  transition: background 0.2s ease;
  position: relative;
  flex-shrink: 0;
  margin: 0;

  &::before {
    content: '';
    position: absolute;
    width: 1rem;
    height: 1rem;
    background: #fff;
    border-radius: 50%;
    top: 0.125rem;
    left: 0.125rem;
    transition: left 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  }

  &:checked {
    background: #4E7FF8;
  }

  &:checked::before {
    left: 1.125rem;
  }
`;

// ── Section header row (label + count/action) ─────────────────────────────────

const SectionHeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.5rem;
`;

// ── Available users section ───────────────────────────────────────────────────

const CountBadge = styled.span`
  font-size: 0.75rem;
  color: #4E7FF8;
  font-weight: 600;
`;

const UserListContainer = styled.div`
  background: #F7F9FB;
  border-radius: 0.375rem;
  padding: 0.625rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  max-height: 10rem;
  overflow-y: auto;
`;

const UserRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const UserAvatar = styled.div<{ $color: string }>`
  width: 1.625rem;
  height: 1.625rem;
  border-radius: 50%;
  background: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.625rem;
  font-weight: 600;
  color: #fff;
  flex-shrink: 0;
`;

const UserAvatarImage = styled.img`
  width: 1.625rem;
  height: 1.625rem;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const UserNameText = styled.span`
  font-size: 0.8125rem;
  color: #1C2B3A;
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const RoleBadge = styled.span`
  font-size: 0.625rem;
  color: #8B9AAF;
  background: #E8EDF2;
  padding: 0.0625rem 0.375rem;
  border-radius: 0.1875rem;
  margin-left: auto;
  flex-shrink: 0;
  white-space: nowrap;
`;

// ── Previously picked section ─────────────────────────────────────────────────

const ClearAllButton = styled.button`
  font-size: 0.6875rem;
  color: #8B9AAF;
  background: none;
  border: none;
  text-decoration: underline;
  text-underline-offset: 2px;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: #6b7d92;
  }
`;

const EmptyStateContainer = styled.div`
  background: #F7F9FB;
  border-radius: 0.375rem;
  padding: 0.875rem;
  text-align: center;
`;

const EmptyStateText = styled.span`
  font-size: 0.8125rem;
  color: #A7B3C3;
`;

const PickedUserListContainer = styled.div`
  background: #F7F9FB;
  border-radius: 0.375rem;
  padding: 0.625rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  max-height: 7.5rem;
  overflow-y: auto;
`;

// <ul> that test selectors target with [data-test="pickRandomUserPreviouslyPickedList"]
const PickedList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
`;

const PickedUserRow = styled.li`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  list-style: none;
`;

// ── Footer / action button ────────────────────────────────────────────────────

const FooterContainer = styled.div`
  padding: 0 1.25rem 1rem;
`;

const PickButton = styled.button`
  width: 100%;
  padding: 0.625rem 0;
  background: #4E7FF8;
  color: #fff;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;

  &:hover {
    background: #3D6DE0;
  }
`;

const NoUsersWarning = styled.p`
  font-size: 0.8125rem;
  color: #8B9AAF;
  text-align: center;
  margin: 0;
  padding: 0.5rem 0;
`;

// ── Outer wrappers ────────────────────────────────────────────────────────────

const PresenterViewWrapper = styled.div`
  font-family: 'Source Sans Pro', Arial, sans-serif;
`;

const ContentPadding = styled.div`
  padding: 1rem 1.25rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const OptionsSection = styled.div``;

const AvailableSection = styled.div``;

const PreviouslyPickedSection = styled.div``;

export {
  SectionLabel,
  OptionsContainer,
  ToggleRow,
  ToggleRowLeft,
  IconCircle,
  ToggleLabelText,
  ToggleCheckbox,
  SectionHeaderRow,
  CountBadge,
  UserListContainer,
  UserRow,
  UserAvatar,
  UserAvatarImage,
  UserNameText,
  RoleBadge,
  ClearAllButton,
  EmptyStateContainer,
  EmptyStateText,
  PickedUserListContainer,
  PickedList,
  PickedUserRow,
  FooterContainer,
  PickButton,
  NoUsersWarning,
  PresenterViewWrapper,
  ContentPadding,
  OptionsSection,
  AvailableSection,
  PreviouslyPickedSection,
};
