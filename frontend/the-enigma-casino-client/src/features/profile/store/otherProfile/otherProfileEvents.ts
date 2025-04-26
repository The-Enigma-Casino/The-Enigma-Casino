import { createEvent } from "effector";

export const loadOtherUserProfile = createEvent<string>();
export const loadOtherUserHistory = createEvent<{ userId: string; page: number }>();
