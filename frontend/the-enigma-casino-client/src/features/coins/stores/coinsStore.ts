import { createStore, createEvent } from "effector";
import { getCoinsByUserFx } from "../actions/coinsActions";

export const loadCoins = createEvent();
export const resetCoins = createEvent();

export const $coins = createStore<number>(0)
  .on(getCoinsByUserFx.doneData, (_, coins) => coins)
  .on(getCoinsByUserFx.failData, (_, error) => {
    console.error("Error al obtener las monedas:", error);
    return 0;
  })
  .reset(resetCoins);

loadCoins.watch(() => console.log("🚀 loadCoins lanzado"));
