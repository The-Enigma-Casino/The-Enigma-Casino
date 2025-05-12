export interface Friend {
  id: number,
  nickName: string,
  image: string,
  isOnline?: boolean
}

export interface FriendRequest {
  id: number;
  senderId: number;
  nickName: string;
  image: string;
}


