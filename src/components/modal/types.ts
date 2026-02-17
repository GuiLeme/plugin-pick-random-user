import { CurrentUserData, DeleteEntryFunction, GraphqlResponseWrapper } from 'bigbluebutton-html-plugin-sdk';
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
  users?: PickedUser[];
  currentPickedUser: PickedUserWithEntryId;
  handlePickRandomUser: () => void;
  currentUser: CurrentUserData;
  dataChannelPickedUsers?: DataChannelEntryResponseType<PickedUser>[];
  deletionFunction: DeleteEntryFunction;
  pickedUserSeenEntries: GraphqlResponseWrapper<
    DataChannelEntryResponseType<PickedUserSeenEntryDataChannel>[]>;
  pushPickedUserSeen: PushEntryFunction<PickedUserSeenEntryDataChannel>;
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
