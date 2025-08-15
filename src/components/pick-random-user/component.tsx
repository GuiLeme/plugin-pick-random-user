import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { createIntl, createIntlCache } from 'react-intl';

import { BbbPluginSdk, PluginApi, RESET_DATA_CHANNEL } from 'bigbluebutton-html-plugin-sdk';
import { hasCurrentUserSeenPickedUser } from '../../commons/utils';
import {
  useGetAllSettings,
  useGetFilterOptions,
  useRequestPermissionForNotification,
} from './hooks';
import {
  PickRandomUserPluginProps,
  PickedUserSeenEntryDataChannel,
  PickedUser,
  PickedUserWithEntryId,
  UsersMoreInformationGraphqlResponse,
} from './types';
import { FilterOptionsContext } from './context';
import { USERS_MORE_INFORMATION } from './queries';
import { PickUserModal } from '../modal/component';
import { Role } from './enums';
import ActionButtonDropdownManager from '../extensible-areas/action-button-dropdown/component';

const LOCALE_REQUEST_OBJECT = (!process.env.NODE_ENV || process.env.NODE_ENV === 'development')
  ? {
    headers: {
      'ngrok-skip-browser-warning': 'any',
    },
  } : null;

function PickRandomUserPlugin({ pluginUuid: uuid }: PickRandomUserPluginProps) {
  BbbPluginSdk.initialize(uuid);
  const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(uuid);

  const [showModal, setShowModal] = useState<boolean>(false);
  const [
    pickedUserWithEntryId,
    setPickedUserWithEntryId] = useState<PickedUserWithEntryId | undefined>();

  const settingsResponseData = pluginApi.usePluginSettings();
  const pickRandomUserSettings = useGetAllSettings(settingsResponseData);
  const { pickedUserTimeWindow, pingSoundEnabled } = pickRandomUserSettings;

  useRequestPermissionForNotification(pingSoundEnabled);

  const currentUserInfo = pluginApi.useCurrentUser();
  const shouldUnmountPlugin = pluginApi.useShouldUnmountPlugin();
  const { data: currentUser } = currentUserInfo;
  const allUsersInfo = pluginApi
    .useCustomSubscription<UsersMoreInformationGraphqlResponse>(USERS_MORE_INFORMATION);
  const { data: allUsers } = allUsersInfo;

  const {
    messages: localeMessages,
    currentLocale,
    loading: localeMessagesLoading,
  } = pluginApi.useLocaleMessages(LOCALE_REQUEST_OBJECT);

  const cache = createIntlCache();
  const intl = (!localeMessagesLoading && localeMessages) ? createIntl({
    locale: currentLocale,
    messages: localeMessages,
    fallbackOnEmptyString: true,
  }, cache) : null;

  const {
    data: pickedUserFromDataChannelResponse,
    pushEntry: pushPickedUser,
    deleteEntry: deletePickedUser,
  } = pluginApi.useDataChannel<PickedUser>('pickRandomUser');

  const [filterOptions, setFilterOptions] = useGetFilterOptions(pluginApi, currentUser?.presenter);
  const {
    skipModerators,
    skipPresenter,
    includePickedUsers,
  } = filterOptions;

  const {
    data: pickedUserSeenEntries,
    pushEntry: pushPickedUserSeen,
    deleteEntry: deletePickedUserSeenEntries,
  } = pluginApi.useDataChannel<PickedUserSeenEntryDataChannel>('pickedUserSeenEntry');

  const pickedUserFromDataChannel = {
    data: pickedUserFromDataChannelResponse?.data,
    loading: false,
  };

  const usersToBePicked: UsersMoreInformationGraphqlResponse = {
    user: allUsers?.user.filter((user) => {
      let roleFilter = true;
      if (skipModerators) roleFilter = user.role === Role.VIEWER;
      if (!includePickedUsers && pickedUserFromDataChannel.data) {
        return roleFilter && pickedUserFromDataChannel
          .data.findIndex(
            (u) => u?.payloadJson?.userId === user?.userId,
          ) === -1;
      }
      return roleFilter;
    }).filter((user) => {
      if (skipPresenter) return !user.presenter;
      return true;
    }),
  };

  const handlePickRandomUser = () => {
    if (usersToBePicked && usersToBePicked.user.length > 0 && currentUser?.presenter) {
      deletePickedUserSeenEntries([RESET_DATA_CHANNEL]);
      const randomIndex = Math.floor(Math.random() * usersToBePicked.user.length);
      const randomlyPickedUser = usersToBePicked.user[randomIndex];
      pushPickedUser(randomlyPickedUser);
    }
    setShowModal(true);
  };

  const handleCloseModal = (): void => {
    if (currentUser?.presenter) {
      pushPickedUser(null);
    }
    setShowModal(false);
  };

  useEffect(() => {
    if (pickedUserFromDataChannel.data
      && pickedUserFromDataChannel.data?.length > 0) {
      const pickedUserToUpdate = pickedUserFromDataChannel
        .data[0];
      if (pickedUserToUpdate?.entryId !== pickedUserWithEntryId?.entryId) {
        setPickedUserWithEntryId({
          pickedUser: pickedUserToUpdate?.payloadJson,
          entryId: pickedUserToUpdate.entryId,
        });
      }
      const hasCurrentUserSeen = hasCurrentUserSeenPickedUser(
        pickedUserSeenEntries,
        currentUser?.userId,
        pickedUserToUpdate?.payloadJson.userId,
      );
      const isPreviousPickInTimeWindow = (
        (new Date().getTime() - new Date(pickedUserToUpdate.createdAt).getTime()) / 1000
          <= pickedUserTimeWindow
      );
      if (
        !hasCurrentUserSeen
        && !pickedUserSeenEntries?.loading
        && isPreviousPickInTimeWindow
      ) {
        setShowModal(true);
      }
    } else if (pickedUserFromDataChannel.data
        && pickedUserFromDataChannel.data?.length === 0) {
      setPickedUserWithEntryId(null);
      if (currentUser && !currentUser.presenter) setShowModal(false);
    }
  }, [pickedUserFromDataChannelResponse, pickedUserSeenEntries, pickedUserTimeWindow]);

  useEffect(() => {
    if (!pickedUserWithEntryId && !currentUser?.presenter) setShowModal(false);
  }, [pickedUserWithEntryId]);

  const value = useMemo(
    () => ({
      filterOptions,
      setFilterOptions,
    }),
    [filterOptions, setFilterOptions],
  );

  useEffect(() => {
    if (!currentUser?.presenter) handleCloseModal();
  }, [currentUser]);

  if (!intl || localeMessagesLoading) return null;

  return !shouldUnmountPlugin && (
    <>
      <FilterOptionsContext.Provider
        value={value}
      >
        <PickUserModal
          {...{
            pickRandomUserSettings,
            intl,
            showModal,
            handleCloseModal,
            users: usersToBePicked?.user,
            pickedUserWithEntryId,
            handlePickRandomUser,
            currentUser,
            dataChannelPickedUsers: pickedUserFromDataChannel.data,
            deletionFunction: deletePickedUser,
            pickedUserSeenEntries,
            pushPickedUserSeen,
          }}
        />
      </FilterOptionsContext.Provider>
      <ActionButtonDropdownManager
        {...{
          intl,
          pickedUserWithEntryId,
          currentUser,
          pluginApi,
          setShowModal,
          currentUserInfo,
        }}
      />
    </>
  );
}

export default PickRandomUserPlugin;
