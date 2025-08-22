import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';

import { BbbPluginSdk, PluginApi, RESET_DATA_CHANNEL } from 'bigbluebutton-html-plugin-sdk';
import {
  useControlModalState,
  useGetAllSettings,
  useGetCurrentPickedUser,
  useGetFilterOptions,
  useRequestPermissionForNotification,
} from './hooks';
import {
  PickRandomUserPluginProps,
  PickedUserSeenEntryDataChannel,
  PickedUser,
} from './types';
import { FilterOptionsContext } from './context';
import { PickUserModal } from '../modal/component';
import ActionButtonDropdownManager from '../extensible-areas/action-button-dropdown/component';
import { filterPossibleUsersToBePicked } from './utils';
import { useGetInternationalization } from '../../commons/hooks';

function PickRandomUserPlugin({ pluginUuid: uuid }: PickRandomUserPluginProps) {
  BbbPluginSdk.initialize(uuid);
  const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(uuid);

  const [showModal, setShowModal] = useState<boolean>(false);

  const settingsResponseData = pluginApi.usePluginSettings();

  const pickRandomUserSettings = useGetAllSettings(settingsResponseData);
  const { pickedUserTimeWindow, pingSoundEnabled } = pickRandomUserSettings;

  useRequestPermissionForNotification(pingSoundEnabled);

  const currentUserInfo = pluginApi.useCurrentUser();
  const shouldUnmountPlugin = pluginApi.useShouldUnmountPlugin();
  const { data: currentUser } = currentUserInfo;
  const allUsersInfo = pluginApi.useUsersBasicInfo();
  const { data: allUsers } = allUsersInfo;

  const {
    intl,
    localeMessagesLoading,
  } = useGetInternationalization(pluginApi);

  const {
    data: pickedUserFromDataChannelResponse,
    pushEntry: pushPickedUser,
    deleteEntry: deletePickedUser,
  } = pluginApi.useDataChannel<PickedUser>('pickRandomUser');
  const pickedUserFromDataChannel = pickedUserFromDataChannelResponse?.data;

  const [filterOptions, setFilterOptions] = useGetFilterOptions(pluginApi, currentUser?.presenter);

  const currentPickedUser = useGetCurrentPickedUser(pickedUserFromDataChannel);

  const {
    data: pickedUserSeenEntries,
    pushEntry: pushPickedUserSeen,
    deleteEntry: deletePickedUserSeenEntries,
  } = pluginApi.useDataChannel<PickedUserSeenEntryDataChannel>('pickedUserSeenEntry');

  const possibleUsersToBePicked = filterPossibleUsersToBePicked(
    allUsers,
    pickedUserFromDataChannel,
    filterOptions,
  );

  const handlePickRandomUser = () => {
    if (
      possibleUsersToBePicked
      && possibleUsersToBePicked.user.length > 0
      && currentUser?.presenter
    ) {
      deletePickedUserSeenEntries([RESET_DATA_CHANNEL]);
      const randomIndex = Math.floor(Math.random() * possibleUsersToBePicked.user.length);
      const randomlyPickedUser = possibleUsersToBePicked.user[randomIndex];
      pushPickedUser(randomlyPickedUser);
    }
  };

  const handleCloseModal = (): void => {
    if (currentUser?.presenter) {
      pushPickedUser(null);
    }
    setShowModal(false);
  };

  useControlModalState(
    pickedUserFromDataChannel,
    pickedUserSeenEntries,
    currentUser,
    pickedUserTimeWindow,
    currentPickedUser,
    setShowModal,
  );

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
            users: possibleUsersToBePicked?.user,
            currentPickedUser,
            handlePickRandomUser,
            currentUser,
            dataChannelPickedUsers: pickedUserFromDataChannel,
            deletionFunction: deletePickedUser,
            pickedUserSeenEntries,
            pushPickedUserSeen,
          }}
        />
      </FilterOptionsContext.Provider>
      <ActionButtonDropdownManager
        {...{
          intl,
          currentPickedUser,
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
