import { createEvent, createStore, sample } from "effector";
import { loadPacksFx } from "../actions/loadPacksAction";
import { updatePackFx } from "../actions/updatePackAction";
import { getPackByIdFx } from "../actions/getPackByIdAction";
import toast from "react-hot-toast";
import { getErrorMessage } from "../../../utils/errorUtils";
import { CoinsPack } from "../../catalog/models/CoinsPack.interface";

export const loadAdminPacks = createEvent();
export const updateAdminPack = createEvent<{
  id: number;
  price: number;
  quantity: number;
  offer: number;
  imageFile?: File | null;
}>();
export const getAdminPackById = createEvent<number>();
export const resetAdminPacks = createEvent();

sample({
  clock: loadAdminPacks,
  target: loadPacksFx,
});

sample({
  clock: updateAdminPack,
  target: updatePackFx,
});

sample({
  clock: getAdminPackById,
  target: getPackByIdFx,
});

updatePackFx.failData.watch((error) => {
  toast.error(getErrorMessage(error), {
    className: "text-lg font-bold p-3",
  });
});

loadPacksFx.failData.watch((error) => {
  toast.error(getErrorMessage(error), {
    className: "text-lg font-bold p-3",
  });
});

getPackByIdFx.failData.watch((error) => {
  toast.error(getErrorMessage(error), {
    className: "text-lg font-bold p-3",
  });
});

export const $adminPacks = createStore<CoinsPack[]>([])
  .on(loadPacksFx.doneData, (_, packs) => packs)
  .on(updatePackFx.done, (state, { params }) =>
    state.map((pack) => (pack.id === params.id ? { ...pack, ...params } : pack))
  )
  .reset(resetAdminPacks);
