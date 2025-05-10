export interface Friend {
  id: number,
  nickname: string,
  image: string,
  isOnline?: boolean
}

export interface FriendRequest {
  id: number;
  senderId: number;
  receiverId: number;
  createdAt: string;
}
