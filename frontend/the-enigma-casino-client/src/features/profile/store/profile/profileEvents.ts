import { createEvent } from "effector";

export const loadUserProfile = createEvent();
export const loadOtherUserProfile = createEvent<number>();

export const userImage = createEvent<String>();