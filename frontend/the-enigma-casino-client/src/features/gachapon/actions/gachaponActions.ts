
import { createEffect } from 'effector';
import axios from 'axios';
import { GACHAPON_PLAY, GACHAPON_PRICE } from '../../../config';
import { getAuthHeaders } from '../../auth/utils/autHeaders';

export const playGachaponFx = createEffect(async () => {
  const response = await axios.post(GACHAPON_PLAY, {}, {
    method: "POST",
    headers: getAuthHeaders(),
  });
  return response.data as number;
});

export const getPriceGachaponFx = createEffect(async () => {
  const response = await axios.get(GACHAPON_PRICE);
  return response.data as number;
});
