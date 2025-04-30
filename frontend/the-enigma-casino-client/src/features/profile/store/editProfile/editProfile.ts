import { createEffect } from "effector";
import axios from "axios";
import { getAuthHeaders } from "../../../auth/utils/authHeaders";
import { USER_IMAGE_UPDATE, USER_DEFAULT_IMAGE_UPDATE, USER_UPDATE, USER_UPDATE_PASSWORD } from "../../../../config";
import { imageUpdated } from "./editEvent";
import { UpdateUserPayload, UpdatePasswordPayload } from "./type";


// Imagenes perfil
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

export const UpdateUserImageDefaultFx = createEffect(async () => {
  const res = await axios.put(USER_DEFAULT_IMAGE_UPDATE, {}, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json",
    },
  });
  return res.data;
})

UpdateUserImageDefaultFx.done.watch(() => {
  imageUpdated();
});

updateUserImageFx.done.watch(() => {
  imageUpdated();
});


// Modificar datos
export const updateUserFx = createEffect<UpdateUserPayload, any, string>(
  async (data) => {
    try {
      const res = await axios.put(USER_UPDATE, data, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
      return res.data;
    } catch (error: any) {
      throw error?.response?.data?.error || "Error al actualizar usuario";
    }
  }
);

// Modificar contraseña

export const updatePasswordFx = createEffect<UpdatePasswordPayload, any, string>(
  async (data) => {
    try {
      const res = await axios.put(USER_UPDATE_PASSWORD, data, {
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
      return res.data;
    } catch (error: any) {
      throw (
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Error al actualizar la contraseña"
      );
    }
  }
);
