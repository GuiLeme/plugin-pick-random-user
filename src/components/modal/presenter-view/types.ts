import { DataChannelEntryResponseType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-channel/types';
import { DeleteEntryFunction, PluginApi } from 'bigbluebutton-html-plugin-sdk';
import { IntlShape } from 'react-intl';
import { PickedUser, PickedUserWithEntryId } from '../../pick-random-user/types';

export interface PresenterViewComponentProps {
    intl: IntlShape;
    deletionFunction: DeleteEntryFunction;
    dataChannelPickedUsers?: DataChannelEntryResponseType<PickedUser>[];
    pickedUserWithEntryId: PickedUserWithEntryId | null;
    pluginApi: PluginApi;
}

export interface FilterOptionsType {
  includeModerators: boolean;
  includePresenter: boolean;
  includePickedUsers: boolean;
}
