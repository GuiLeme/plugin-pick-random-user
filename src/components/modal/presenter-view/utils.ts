import { DataChannelEntryResponseType, UsersBasicInfoResponseFromGraphqlWrapper } from 'bigbluebutton-html-plugin-sdk';
import {
  PickedUser,
} from '../../pick-random-user/types';
import { Role } from '../../pick-random-user/enums';
import { FilterOptionsType } from './types';

export const filterPossibleUsersToBePicked = (
  allUsers: UsersBasicInfoResponseFromGraphqlWrapper | undefined,
  pickedUserFromDataChannel: DataChannelEntryResponseType<PickedUser>[],
  filterOptions: FilterOptionsType,
) => ({
  user: allUsers?.user.filter((user) => !user.bot).filter((user) => {
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
  }) || [],
});
