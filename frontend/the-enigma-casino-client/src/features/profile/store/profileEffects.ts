import axios from "axios";
import { createEffect } from "effector";

import { getAuthHeaders } from "../../auth/utils/authHeaders";
import { OTHER_USER_PROFILE, USER_PROFILE } from "../../../config";
import { loadOtherUserProfile, loadUserProfile } from "./profileEvents";


export const getUserProfileFx = createEffect(async () => {
  const response = await axios.get(USER_PROFILE, {
    headers: getAuthHeaders(),
  });
  return response.data;
});

export const getOtherUserProfileFx = createEffect(async (userId: number) => {
  const response = await axios.get(`${OTHER_USER_PROFILE}${userId}`, {
    headers: getAuthHeaders(),
  });
  return response.data;
});


loadUserProfile.watch(() => {
  getUserProfileFx();  
});

loadOtherUserProfile.watch((userId) => {
  getOtherUserProfileFx(userId);  
});