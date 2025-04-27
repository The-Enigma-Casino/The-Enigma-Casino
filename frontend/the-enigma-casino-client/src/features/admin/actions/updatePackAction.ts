import { createEffect } from "effector";
import axios from "axios";
import { getAuthHeaders } from "../../auth/utils/authHeaders";
import { UPDATE_PACK_ADMIN } from "../../../config";

interface UpdatePackDto {
  id: number;
  price: number;
  quantity: number;
  offer: number;
  imageFile?: File | null;
}

export const updatePackFx = createEffect(async (data: UpdatePackDto) => {
  const formData = new FormData();
  formData.append("Id", data.id.toString());
  formData.append("Price", data.price.toString());
  formData.append("Quantity", data.quantity.toString());
  formData.append("Offer", data.offer.toString());

  if (data.imageFile) {
    formData.append("ImageFile", data.imageFile);
  }

  const response = await axios.put(`${UPDATE_PACK_ADMIN}`, formData, {
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "multipart/form-data",
    },
    withCredentials: true,
  });

  return response.data;
});
