import { createStore, sample } from "effector";
import { loadOtherUserProfile, loadOtherUserHistory } from "./otherProfileEvents";
import { loadOtherUserProfileFx, getOtherUserHistoryFx } from "./otherProfileEffects";
import type { HistoryResponse, OtherUserProfile } from "../history/types";

// Profile

export const $otherUserProfile = createStore<OtherUserProfile | null>(null).on(
  loadOtherUserProfileFx.doneData,
  (_, profile) => profile
);

// History

export const $otherUserHistory = createStore<HistoryResponse["gamesDtos"]>([]).on(
  getOtherUserHistoryFx.doneData,
  (_, payload) => payload.gamesDtos
);

export const $otherUserHistoryPage = createStore(1).on(
  getOtherUserHistoryFx.doneData,
  (_, payload) => payload.page
);

export const $otherUserHistoryTotalPages = createStore(1).on(
  getOtherUserHistoryFx.doneData,
  (_, payload) => payload.totalPages
);


loadOtherUserProfile.watch((userId) => {
  loadOtherUserProfileFx(userId);
});

loadOtherUserHistory.watch(({ userId, page }) => {
  getOtherUserHistoryFx({ userId, page });
});

sample({
  clock: loadOtherUserProfile,
  target: loadOtherUserProfileFx,
});
