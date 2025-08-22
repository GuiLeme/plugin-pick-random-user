import { DataChannelEntryResponseType, UsersBasicInfoResponseFromGraphqlWrapper } from 'bigbluebutton-html-plugin-sdk';
import {
  FilterOptionsType,
  PickedUser,
} from './types';
import { Role } from './enums';

export const filterPossibleUsersToBePicked = (
  allUsers: UsersBasicInfoResponseFromGraphqlWrapper,
  pickedUserFromDataChannel: DataChannelEntryResponseType<PickedUser>[],
  filterOptions: FilterOptionsType,
) => ({
  user: allUsers?.user.filter((user) => {
    if (!filterOptions.includeModerators) return user.role === Role.VIEWER;
    return true;
  }).filter((user) => {
    if (!filterOptions.includePresenter) return !user.presenter;
    return true;
  }).filter((user) => {
    if (!filterOptions.includePickedUsers && pickedUserFromDataChannel) {
      return pickedUserFromDataChannel.findIndex(
        (u) => u?.payloadJson?.userId === user?.userId,
      ) === -1;
    }
    return true;
  }),
});
