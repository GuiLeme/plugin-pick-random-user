import { CurrentUserData, GraphqlResponseWrapper, PluginApi } from 'bigbluebutton-html-plugin-sdk';
import { IntlShape } from 'react-intl';
import { PickedUserWithEntryId } from '../../pick-random-user/types';

export interface ActionButtonDropdownManagerProps {
    intl: IntlShape
    currentPickedUser: PickedUserWithEntryId;
    currentUser: CurrentUserData;
    pluginApi: PluginApi;
    setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
    currentUserInfo: GraphqlResponseWrapper<CurrentUserData>;
}
