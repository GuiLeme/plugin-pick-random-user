import {
  CurrentUserData,
  DeleteEntryFunction,
  GraphqlResponseWrapper,
  PluginApi,
} from 'bigbluebutton-html-plugin-sdk';
import { IntlShape } from 'react-intl';
import { DataChannelEntryResponseType, PushEntryFunction } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/types';
import { PickedUser, PickedUserWithEntryId, PickedUserSeenEntryDataChannel } from '../pick-random-user/types';
import { PickRandomUserSettings } from '../../commons/types';

export interface PickUserModalProps {
  pickRandomUserSettings: PickRandomUserSettings
  uuid: string,
  intl: IntlShape
  showModal: boolean;
  handleCloseModal: () => void;
  pluginApi: PluginApi;
  currentPickedUser: PickedUserWithEntryId | null;
  currentUser: CurrentUserData;
  dataChannelPickedUsers?: DataChannelEntryResponseType<PickedUser>[];
  deletionFunction: DeleteEntryFunction;
  pickedUserSeenEntries: GraphqlResponseWrapper<
    DataChannelEntryResponseType<PickedUserSeenEntryDataChannel>[]>;
  pushPickedUserSeen: PushEntryFunction<PickedUserSeenEntryDataChannel>;
}

export interface FilterOptionsType {
  includeModerators: boolean;
  includePresenter: boolean;
  includePickedUsers: boolean;
}

export interface WindowClientSettings extends Window {
  meetingClientSettings?: {
    public: {
      app: {
        cdn: string;
        basename: string;
      }

    }
  }
}
