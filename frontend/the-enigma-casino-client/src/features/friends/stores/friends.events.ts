import { createEvent } from "effector";
import { Friend, FriendRequest } from "./friends.types";



export const setFriends = createEvent<Friend[]>();
export const setOnlineFriends = createEvent<number[]>();
export const setReceivedRequests = createEvent<FriendRequest[]>();

export const updateFriendOnlineStatus = createEvent<{ id: number; isOnline: boolean }>();

export const resetFriends = createEvent();


