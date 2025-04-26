import { createEvent, createStore, sample } from "effector";
import { loadUserProfile } from "../profile/profileEvents";

export const imageUpdated = createEvent();

export const $imageEdit = createStore(0).on(imageUpdated, (state) => state + 1);


sample({
  clock: imageUpdated,
  target: loadUserProfile,
});
