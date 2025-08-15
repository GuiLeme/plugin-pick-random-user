export interface PickedUser {
    presenter: boolean;
    userId: string;
    name: string;
    role: string;
    avatar: string;
    color: string;
}

export interface PickedUserWithEntryId {
    pickedUser: PickedUser;
    entryId: string;
}

export interface PickRandomUserPluginProps {
    pluginName: string,
    pluginUuid: string,
}

export interface UsersMoreInformationGraphqlResponse {
    user: PickedUser[];
}

export interface PickedUserSeenEntryDataChannel {
    pickedUserId: string;
    seenByUserId: string;
}

export interface FilterOptionsType {
  skipModerators: boolean;
  skipPresenter: boolean;
  includePickedUsers: boolean;
}
