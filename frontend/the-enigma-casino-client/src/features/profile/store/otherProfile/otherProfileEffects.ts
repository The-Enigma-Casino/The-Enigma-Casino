import { createEffect } from "effector";
import axios from "axios";
import { OTHER_USER_PROFILE, USER_HISTORY_BY_ID } from "../../../../config";
import { getAuthHeaders } from "../../../auth/utils/authHeaders";
import type { OtherUserProfile, HistoryResponse } from "../history/types";

export const loadOtherUserProfileFx = createEffect(async (userId: string): Promise<OtherUserProfile> => {
  const response = await axios.get(`${OTHER_USER_PROFILE}${userId}`, {
    headers: getAuthHeaders(),
  });

  const data = response.data;

  return {
    nickname: data.nickName,
    country: data.country,
    image: data.image,
    relation: data.relation,
  };
});

export const getOtherUserHistoryFx = createEffect(
  async ({ userId, page }: { userId: string; page: number }): Promise<HistoryResponse> => {
    const response = await axios.get(`${USER_HISTORY_BY_ID}?userId=${userId}&page=${page}`, {
      headers: getAuthHeaders(),
    });

    return response.data;
  }
);
