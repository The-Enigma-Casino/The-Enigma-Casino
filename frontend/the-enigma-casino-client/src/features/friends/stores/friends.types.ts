export interface Friend {
  id: number,
  nickName: string,
  image: string,
  isOnline?: boolean
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


