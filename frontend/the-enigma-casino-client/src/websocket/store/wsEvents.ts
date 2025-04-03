import { createEvent } from "effector";

export const connectSocket = createEvent();
export const disconnectSocket = createEvent();
export const messageSent = createEvent<string>();
export const socketMessageReceived = createEvent<any>();
export const socketError = createEvent<Error>();
export const updateOnlineUsers = createEvent<number>();