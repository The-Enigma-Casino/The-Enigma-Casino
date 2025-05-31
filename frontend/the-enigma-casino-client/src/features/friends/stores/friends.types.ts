export type UserStatus = "Online" | "Offline" | "Playing";
export interface Friend {
  id: number,
  nickName: string,
  image: string,
  isOnline?: boolean,
  status?: UserStatus
}

export interface SearchUser {
  id: number,
  nickName: string,
  image: string,
}

export interface FriendRequest {
  id: number;
  senderId: number;
  nickName: string;
  image: string;
}

export type SimpleAlertType = "friend_request" | "game_invite";

type AlertMetaMap = {
  friend_request: { senderId: number };
  game_invite: { inviterId: number; tableId: number; mode?: "table" | "friendsList"; toastId?: string };
};


export interface SimpleAlert<T extends SimpleAlertType = SimpleAlertType> {
  id: string;
  type: T;
  nickname: string;
  image: string;
  timestamp: number;
  meta: AlertMetaMap[T];
}
