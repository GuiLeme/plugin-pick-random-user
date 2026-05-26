import * as React from 'react';
import { useState, useEffect } from 'react';

import { BbbPluginSdk, PluginApi } from 'bigbluebutton-html-plugin-sdk';
import {
  useControlModalState,
  useGetAllSettings,
  useGetCurrentPickedUser,
  useRequestPermissionForNotification,
} from './hooks';
import {
  PickRandomUserPluginProps,
  PickedUserSeenEntryDataChannel,
  PickedUser,
} from './types';
import { PickUserModal } from '../modal/component';
import ActionButtonDropdownManager from '../extensible-areas/action-button-dropdown/component';
import { useGetInternationalization } from '../../commons/hooks';

function PickRandomUserPlugin({ pluginUuid: uuid }: PickRandomUserPluginProps) {
  BbbPluginSdk.initialize(uuid);
  const pluginApi: PluginApi = BbbPluginSdk.getPluginApi(uuid);

  const [showModal, setShowModal] = useState<boolean>(false);

  const settingsResponseData = pluginApi.usePluginSettings();

  const pickRandomUserSettings = useGetAllSettings(settingsResponseData);
  const { pickedUserTimeWindow, browserNotificationEnabled } = pickRandomUserSettings;

  useRequestPermissionForNotification(browserNotificationEnabled);

  const currentUserInfo = pluginApi.useCurrentUser();
  const shouldUnmountPlugin = pluginApi.useShouldUnmountPlugin();
  const { data: currentUser } = currentUserInfo;

  const {
    intl,
    localeMessagesLoading,
  } = useGetInternationalization(pluginApi);

  const {
    data: pickedUserFromDataChannelResponse,
    deleteEntry: deletePickedUser,
  } = pluginApi.useDataChannel<PickedUser>('pickRandomUser');
  const pickedUserFromDataChannel = pickedUserFromDataChannelResponse?.data;

  const currentPickedUser = useGetCurrentPickedUser(pickedUserFromDataChannel);

  const {
    data: pickedUserSeenEntries,
    pushEntry: pushPickedUserSeen,
  } = pluginApi.useDataChannel<PickedUserSeenEntryDataChannel>('pickedUserSeenEntry');

  const handleCloseModal = (): void => {
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

  useEffect(() => {
    if (!currentUser?.presenter) handleCloseModal();
  }, [currentUser]);

  if (!intl || localeMessagesLoading) return null;

  return !shouldUnmountPlugin && (
    <>
      <PickUserModal
        {...{
          uuid,
          pluginApi,
          pickRandomUserSettings,
          intl,
          showModal,
          handleCloseModal,
          currentPickedUser,
          currentUser,
          dataChannelPickedUsers: pickedUserFromDataChannel,
          deletionFunction: deletePickedUser,
          pickedUserSeenEntries,
          pushPickedUserSeen,
        }}
      />
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
