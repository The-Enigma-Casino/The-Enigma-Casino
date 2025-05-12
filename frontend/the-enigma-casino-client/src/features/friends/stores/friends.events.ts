import { createEvent } from "effector";
import { Friend, FriendRequest } from "./friends.types";



export const setFriends = createEvent<Friend[]>();
export const setOnlineFriends = createEvent<number[]>();
export const setReceivedRequests = createEvent<FriendRequest[]>();
export const resetSearchResults = createEvent();
export const resetReceivedRequests = createEvent();
export const removeReceivedRequest = createEvent<number>();

export const updateFriendOnlineStatus = createEvent<{ id: number; isOnline: boolean }>();

export const resetFriends = createEvent();


