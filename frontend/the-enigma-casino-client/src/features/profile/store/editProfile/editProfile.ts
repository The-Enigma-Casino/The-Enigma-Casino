import { createEffect } from "effector";
import axios from "axios";
import { getAuthHeaders } from "../../../auth/utils/authHeaders";
import { USER_IMAGE_UPDATE } from "../../../../config";
import { imageUpdated } from "./editEvent";

export const updateUserImageFx = createEffect(async (imageFile: File | null) => {
  const formData = new FormData();
  if (imageFile) {
    formData.append("image", imageFile);
  }

  const res = await axios.put(USER_IMAGE_UPDATE, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
});

updateUserImageFx.done.watch(() => {
  imageUpdated();
});
