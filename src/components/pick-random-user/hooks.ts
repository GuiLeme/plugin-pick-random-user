import {
  CurrentUserData,
  DataChannelEntryResponseType,
  DataChannelTypes,
  GraphqlResponseWrapper,
  PluginApi,
  PushEntryFunction,
} from 'bigbluebutton-html-plugin-sdk';
import { PluginSettingsData } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/domain/settings/plugin-settings/types';
import { useEffect, useState } from 'react';
import { PICKED_USER_TIME_WINDOW } from '../../commons/constants';
import { hasCurrentUserSeenPickedUser, isNumber } from '../../commons/utils';
import { PickRandomUserSettings } from '../../commons/types';
import { WindowClientSettings } from '../modal/types';
import {
  FilterOptionsType,
  PickedUser,
  PickedUserSeenEntryDataChannel,
  PickedUserWithEntryId,
} from './types';

declare const window: WindowClientSettings;

// Settings hooks and utilities

const useSettingsLoaded = (
  callback: (settings: PluginSettingsData) => void,
  settingsData: GraphqlResponseWrapper<PluginSettingsData>,
) => {
  const { data: pluginSettings, loading: isPluginSettingsLoading } = settingsData;
  useEffect(() => {
    if (!isPluginSettingsLoading && pluginSettings) {
      callback(pluginSettings);
    }
  }, [isPluginSettingsLoading, pluginSettings]);
};

export const useRequestPermissionForNotification = (
  pingSoundEnabled: boolean,
) => {
  useEffect(() => {
    if (pingSoundEnabled) {
      Notification.requestPermission();
    }
  }, [pingSoundEnabled]);
};

export const getPingSoundEnabled = (
  settings: PluginSettingsData,
): boolean => !!settings.pingSoundEnabled;

const getPickedUserTimeWindowFromSettings = (settings: PluginSettingsData) => {
  const settingTimeWindow = settings.pickedUserTimeWindow as unknown;
  if (isNumber(settingTimeWindow)) {
    const timeWindow: number = settingTimeWindow as number;
    return timeWindow;
  } return PICKED_USER_TIME_WINDOW;
};

const getPingSoundUrl = (settings: PluginSettingsData): string => {
  const { cdn, basename } = window.meetingClientSettings.public.app;
  const host = cdn + basename;
  const pingSoundUrl: string = settings.pingSoundUrl
    ? String(settings.pingSoundUrl)
    : `${host}/resources/sounds/doorbell.mp3`;
  return pingSoundUrl;
};

export const useGetAllSettings = (
  settingsData: GraphqlResponseWrapper<PluginSettingsData>,
): PickRandomUserSettings => {
  const [pingSoundEnabled, setPingSoundEnabled] = useState<boolean>(false);
  const [pingSoundUrl, setPingSoundUrl] = useState<string>('');
  const [pickedUserTimeWindow, setPickedUserTimeWindow] = useState<number>(PICKED_USER_TIME_WINDOW);
  useSettingsLoaded((settings) => {
    setPickedUserTimeWindow(getPickedUserTimeWindowFromSettings(settings));
    setPingSoundEnabled(getPingSoundEnabled(settings));
    setPingSoundUrl(getPingSoundUrl(settings));
  }, settingsData);
  return {
    pingSoundEnabled,
    pingSoundUrl,
    pickedUserTimeWindow,
  };
};

// Filter Options hooks and utilities

const useUpdateFilterOptionsOnDataChannel = (
  pushFilterOptionsToDataChannel: PushEntryFunction<FilterOptionsType>,
  filterOptions: FilterOptionsType,
  isPresenter: boolean,
  dataChannelLoading: boolean,
) => {
  useEffect(() => {
    if (isPresenter && !dataChannelLoading) {
      pushFilterOptionsToDataChannel(filterOptions);
    }
  }, [isPresenter, filterOptions, dataChannelLoading]);
};

const hasFilterOptionsChanged = (
  currentFilterOptions: FilterOptionsType,
  filterOptionsFromDataChannel?: FilterOptionsType,
) => filterOptionsFromDataChannel?.includePickedUsers !== currentFilterOptions.includePickedUsers
  || filterOptionsFromDataChannel?.skipModerators !== currentFilterOptions.skipModerators
  || filterOptionsFromDataChannel?.skipPresenter !== currentFilterOptions.skipPresenter;

const useObserveFilterOptionsFromDataChannel = (
  currentFilterOptions: FilterOptionsType,
  filterOptionsFromDataChannel: FilterOptionsType | undefined,
  setFilterOptions: React.Dispatch<React.SetStateAction<FilterOptionsType>>,
) => {
  useEffect(() => {
    if (
      filterOptionsFromDataChannel
      && hasFilterOptionsChanged(currentFilterOptions, filterOptionsFromDataChannel)) {
      setFilterOptions({
        includePickedUsers: filterOptionsFromDataChannel.includePickedUsers,
        skipModerators: filterOptionsFromDataChannel.skipModerators,
        skipPresenter: filterOptionsFromDataChannel.skipPresenter,
      });
    }
  }, [filterOptionsFromDataChannel]);
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
    skipModerators: true,
    skipPresenter: true,
    includePickedUsers: true,
  });
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
  );
  useUpdateFilterOptionsOnDataChannel(
    pushFilterOptionsToDataChannel,
    filterOptions,
    currentUserPresenter,
    filterOptionsFromDataChannel.loading,
  );
  return [filterOptions, setFilterOptions];
};

// ---

export const useGetCurrentPickedUser = (
  pickedUserFromDataChannel: DataChannelEntryResponseType<PickedUser>[],
): PickedUserWithEntryId | undefined => {
  const [
    pickedUserWithEntryId,
    setPickedUserWithEntryId] = useState<PickedUserWithEntryId | undefined>();

  useEffect(() => {
    if (pickedUserFromDataChannel
      && pickedUserFromDataChannel?.length > 0) {
      const pickedUserToUpdate = pickedUserFromDataChannel[0];
      if (pickedUserToUpdate?.entryId !== pickedUserWithEntryId?.entryId) {
        setPickedUserWithEntryId({
          pickedUser: pickedUserToUpdate?.payloadJson,
          entryId: pickedUserToUpdate.entryId,
        });
      }
    } else if (pickedUserFromDataChannel
        && pickedUserFromDataChannel?.length === 0) {
      setPickedUserWithEntryId(null);
    }
  }, [pickedUserFromDataChannel]);
  return pickedUserWithEntryId;
};

export const useControlModalState = (
  pickedUserFromDataChannel: DataChannelEntryResponseType<PickedUser>[],
  pickedUserSeenEntries: GraphqlResponseWrapper<
    DataChannelEntryResponseType<PickedUserSeenEntryDataChannel>[]>,
  currentUser: CurrentUserData,
  pickedUserTimeWindow: number,
  currentPickedUser: PickedUserWithEntryId,
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const hasValidPickInTimeWindow = (pickedUser?: DataChannelEntryResponseType<PickedUser>) => {
    if (!pickedUser) return false;
    const secondsSincePick = (Date.now() - new Date(pickedUser.createdAt).getTime()) / 1000;
    return secondsSincePick <= pickedUserTimeWindow;
  };

  const hasUserSeenPickedUser = (pickedUser?: DataChannelEntryResponseType<PickedUser>) => {
    if (!pickedUser) return false;
    return hasCurrentUserSeenPickedUser(
      pickedUserSeenEntries,
      currentUser?.userId,
      pickedUser.payloadJson.userId,
    );
  };

  const shouldShowModal = (pickedUser?: DataChannelEntryResponseType<PickedUser>) => {
    if (!pickedUser) return false;
    return (
      !hasUserSeenPickedUser(pickedUser)
      && !pickedUserSeenEntries?.loading
      && hasValidPickInTimeWindow(pickedUser)
    );
  };

  useEffect(() => {
    const firstPick = pickedUserFromDataChannel?.[0];

    if (firstPick && shouldShowModal(firstPick)) {
      setShowModal(true);
      return;
    }

    const shouldCloseModal = (!firstPick && !currentUser?.presenter)
      || (!currentPickedUser && !currentUser?.presenter);

    if (shouldCloseModal) {
      setShowModal(false);
    }
  }, [currentPickedUser, pickedUserFromDataChannel, pickedUserSeenEntries, pickedUserTimeWindow]);
};
