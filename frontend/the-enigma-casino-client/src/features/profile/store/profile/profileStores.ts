// src/features/profile/store.ts
import { createStore } from "effector";
import {
  getOtherUserProfileFx,
  getUserImageFx,
  getUserProfileFx,
} from "./profileEffects";
import { UserData } from "../../interface/UserData.interface";

export const $userProfile = createStore<UserData | null>(null).on(
  getUserProfileFx.doneData,
  (_, payload) => ({ ...payload })
);

export const $otherUserProfile = createStore(null)
  .on(getOtherUserProfileFx.doneData, (_, profile) => profile)
  .reset(getOtherUserProfileFx.failData);

export const $userImage = createStore<string | null>(null, { skipVoid: false })
  .on(getUserImageFx.doneData, (_, image) => image)
  .reset(getUserImageFx.failData);
