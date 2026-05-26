import {
  DataChannelEntryResponseType,
  DataChannelTypes,
  GraphqlResponseWrapper,
  PluginApi,
  PushEntryFunction,
  RESET_DATA_CHANNEL,
  UsersBasicInfoData,
} from 'bigbluebutton-html-plugin-sdk';
import { useEffect, useState } from 'react';
import {
  FilterOptionsType,
} from './types';
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

// Filter Options hooks and utilities

const useUpdateFilterOptionsOnDataChannel = (
  pushFilterOptionsToDataChannel: PushEntryFunction<FilterOptionsType>,
  filterOptions: FilterOptionsType,
  isPresenter: boolean,
  dataChannelLoading: boolean,
  hasDataChannelBeenApplied: boolean,
) => {
  useEffect(() => {
    if (hasDataChannelBeenApplied && isPresenter && !dataChannelLoading) {
      pushFilterOptionsToDataChannel(filterOptions);
    }
  }, [isPresenter, filterOptions, dataChannelLoading, hasDataChannelBeenApplied]);
};

const hasFilterOptionsChanged = (
  currentFilterOptions: FilterOptionsType,
  filterOptionsFromDataChannel?: FilterOptionsType,
) => filterOptionsFromDataChannel?.includePickedUsers !== currentFilterOptions.includePickedUsers
  || filterOptionsFromDataChannel?.includeModerators !== currentFilterOptions.includeModerators
  || filterOptionsFromDataChannel?.includePresenter !== currentFilterOptions.includePresenter;

const useObserveFilterOptionsFromDataChannel = (
  currentFilterOptions: FilterOptionsType,
  filterOptionsFromDataChannel: FilterOptionsType | null,
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptionsType>>,
  dataChannelLoading: boolean,
  setHasDataChannelBeenApplied: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  useEffect(() => {
    if (dataChannelLoading) return;
    setHasDataChannelBeenApplied(true);
    if (filterOptionsFromDataChannel
      && hasFilterOptionsChanged(currentFilterOptions, filterOptionsFromDataChannel)) {
      setFilterOptions({
        includePickedUsers: filterOptionsFromDataChannel.includePickedUsers,
        includeModerators: filterOptionsFromDataChannel.includeModerators,
        includePresenter: filterOptionsFromDataChannel.includePresenter,
      });
    }
  }, [filterOptionsFromDataChannel, dataChannelLoading]);
};

const getLatestFilterOptionsFromDataChannel = (
  filterOptionsFromDataChannelResponse: GraphqlResponseWrapper<
    DataChannelEntryResponseType<FilterOptionsType>[]
  >,
) => {
  const persistedFilterOptionsList = filterOptionsFromDataChannelResponse.data;
  const currentFilterOptionsFromDataChannel = persistedFilterOptionsList
    ? persistedFilterOptionsList[0]?.payloadJson : null;
  return currentFilterOptionsFromDataChannel;
};

export const useGetFilterOptions = (
  pluginApi: PluginApi,
  currentUserPresenter: boolean,
): [FilterOptionsType, React.Dispatch<React.SetStateAction<FilterOptionsType>>] => {
  const [filterOptions, setFilterOptions] = useState<FilterOptionsType>({
    includeModerators: false,
    includePresenter: false,
    includePickedUsers: false,
  });
  const [hasDataChannelBeenApplied, setHasDataChannelBeenApplied] = useState(false);
  const {
    data: filterOptionsFromDataChannel,
    pushEntry: pushFilterOptionsToDataChannel,
  } = pluginApi.useDataChannel<FilterOptionsType>('filterOptions', DataChannelTypes.LATEST_ITEM);
  const latestFilterOptionFromDataChannel = getLatestFilterOptionsFromDataChannel(
    filterOptionsFromDataChannel,
  );
  useObserveFilterOptionsFromDataChannel(
    filterOptions,
    latestFilterOptionFromDataChannel,
    setFilterOptions,
    filterOptionsFromDataChannel.loading,
    setHasDataChannelBeenApplied,
  );
  useUpdateFilterOptionsOnDataChannel(
    pushFilterOptionsToDataChannel,
    filterOptions,
    currentUserPresenter,
    filterOptionsFromDataChannel.loading,
    hasDataChannelBeenApplied,
  );
  return [filterOptions, setFilterOptions];
};
