import { createEvent } from "effector";
import { FriendRequest, SearchUser, SimpleAlert } from "./friends.types";

// Friends
export const resetSearchResults = createEvent();
export const resetReceivedRequests = createEvent();
export const removeReceivedRequest = createEvent<number>();
export const setReceivedRequests = createEvent<FriendRequest[]>();
export const setSearchResults = createEvent<SearchUser[]>();

export const getOnlineFriendsRequested = createEvent();
export const friendRequestReceived = createEvent<{ senderId: number; nickname: string; image: string }>();
export const friendRequestAccepted = createEvent<{ friendId: number; nickname: string; image: string }>();
export const friendRemoved = createEvent<{ removedBy: number }>();
export const onlineFriendsUpdated = createEvent<{ friends: { id: number; nickname: string; image: string }[] }>();
export const rejectFriendRequest = createEvent<{ senderId: number }>();
export const requestAccepted = createEvent<{ friendId: number }>();

export const sendFriendRequestWs = createEvent<{ receiverId: number }>();
export const sendFriendRequest = createEvent<{ receiverId: number }>();
export const acceptFriendRequest = createEvent<{ senderId: number }>();
export const removeFriend = createEvent<{ friendId: number }>();
export const removeUserFromSearchResults = createEvent<number>(); // userId
export const setOnlineFriends = createEvent<number[]>();
export const newFriendRequestsDetected = createEvent<SimpleAlert<"friend_request">[]>()

// Games
export const acceptGameInvite = createEvent<{ inviterId: number; tableId: number }>();
export const rejectGameInvite = createEvent<{ inviterId: number }>();
export const acceptTableInvite = createEvent<{ inviterId: number; tableId: number }>();
export const inviteFriendFromTable = createEvent<{ friendId: number; tableId: number }>();
export const inviteFriendFromList = createEvent<{ friendId: number; gameType: string }>();

// Modal carga
export const startGameLoading = createEvent();
export const stopGameLoading = createEvent();

// Bells
export const bellReset = createEvent();
export const bellNewAlert = createEvent();
export const bellNotification = createEvent();
export const bellTimeoutExpired = createEvent();

export const addSimpleAlert = createEvent<SimpleAlert>();
export const removeSimpleAlert = createEvent<string>();
export const clearAllSimpleAlerts = createEvent();
export const bulkAddSimpleAlerts = createEvent<SimpleAlert[]>();
export const userSessionInitialized = createEvent();
export const fetchReceivedRequests = createEvent<{ isInitial: boolean }>();

