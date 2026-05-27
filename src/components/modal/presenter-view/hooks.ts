import {
  PluginApi,
  RESET_DATA_CHANNEL,
  UsersBasicInfoData,
} from 'bigbluebutton-html-plugin-sdk';
import {
  FilterOptionsType,
} from '../types';
import { PickedUser, PickedUserSeenEntryDataChannel } from '../../pick-random-user/types';
import { filterPossibleUsersToBePicked } from './utils';

export function useGetPickRandomUserFunction(
  pluginApi: PluginApi,
  possibleUsersToBePicked: UsersBasicInfoData[],
) {
  const currentUserInfo = pluginApi.useCurrentUser();
  const { data: currentUser } = currentUserInfo;

  const {
    pushEntry: pushPickedUser,
  } = pluginApi.useDataChannel<PickedUser>('pickRandomUser');

  const {
    deleteEntry: deletePickedUserSeenEntries,
  } = pluginApi.useDataChannel<PickedUserSeenEntryDataChannel>('pickedUserSeenEntry');

  const handlePickRandomUser = () => {
    if (
      possibleUsersToBePicked
      && possibleUsersToBePicked.length > 0
      && currentUser?.presenter
    ) {
      deletePickedUserSeenEntries([RESET_DATA_CHANNEL]);
      const randomIndex = Math.floor(Math.random() * possibleUsersToBePicked.length);
      const randomlyPickedUser = possibleUsersToBePicked[randomIndex];
      pushPickedUser(randomlyPickedUser);
    }
  };

  return handlePickRandomUser;
}

export function useGetPossibleUsersToBePicked(
  pluginApi: PluginApi,
  filterOptions: FilterOptionsType,
) {
  const allUsersInfo = pluginApi?.useUsersBasicInfo
    ? pluginApi?.useUsersBasicInfo()
    : { data: undefined as undefined };
  const { data: allUsers } = allUsersInfo;

  const {
    data: pickedUserFromDataChannelResponse,
  } = pluginApi.useDataChannel<PickedUser>('pickRandomUser');
  const pickedUserFromDataChannel = pickedUserFromDataChannelResponse?.data || [];

  return filterPossibleUsersToBePicked(
    allUsers,
    pickedUserFromDataChannel,
    filterOptions,
  ).user;
}
